<template>
  <div class="annotator" ref="containerRef">
    <div class="image-wrapper" :style="{ width: displayWidth + 'px' }">
      <img
        ref="imgRef"
        :src="imageUrl"
        alt="建筑图片"
        @load="onImageLoad"
      />
      <!-- 可交互标注层 -->
      <div
        v-if="result && (showBbox || showComponents)"
        class="overlay-layer"
        :style="{ width: displayWidth + 'px', height: displayHeight + 'px' }"
        @mousemove="onOverlayMouseMove"
        @mouseup="onOverlayMouseUp"
        @mouseleave="onOverlayMouseUp"
      >
        <!-- 建筑边界框 -->
        <div
          v-if="showBbox && result.bbox"
          class="box bbox-box"
          :style="bboxStyle"
          @mousedown.stop="onBoxMouseDown($event, 'bbox')"
        >
          <div
            v-for="handle in resizeHandles"
            :key="handle"
            class="resize-handle"
            :class="handle"
            :style="getHandleStyle(handle)"
            @mousedown.stop="onResizeStart($event, 'bbox', handle)"
          />
        </div>

        <!-- 构件标注框 -->
        <template v-if="showComponents && result.components?.length">
          <div
            v-for="(comp, i) in result.components"
            :key="i"
            class="box component-box"
            :style="getComponentBoxStyle(comp)"
            @mousedown.stop="onBoxMouseDown($event, 'component', i)"
            @dblclick.stop="onDuplicateComponent(i)"
          >
            <!-- 可编辑标签 -->
            <div
              v-if="showLabels"
              class="component-label"
              @dblclick.stop="startEditLabel(i)"
            >
              <span v-if="editingLabelIndex !== i">{{ comp.name }}</span>
              <input
                v-else
                ref="labelInputRef"
                type="text"
                v-model="editingLabelValue"
                @blur="finishEditLabel"
                @keydown.enter.prevent="finishEditLabel"
                @keydown.esc="cancelEditLabel"
                @click.stop
              />
            </div>
            <div
              v-for="handle in resizeHandles"
              :key="handle"
              class="resize-handle"
              :class="handle"
              :style="getHandleStyle(handle)"
              @mousedown.stop="onResizeStart($event, 'component', handle, i)"
            />
          </div>
        </template>
      </div>
    </div>
    <div class="legend" v-if="result">
      <div class="legend-item" v-if="showBbox">
        <span class="dot bbox"></span> 建筑边界
      </div>
      <div class="legend-item" v-if="showComponents">
        <span class="dot component"></span> 构件标注
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  imageUrl: String,
  result: Object,
  showBbox: { type: Boolean, default: true },
  showComponents: { type: Boolean, default: true },
  showLabels: { type: Boolean, default: true }
})

const emit = defineEmits(['update:bbox', 'update:components'])

const containerRef = ref(null)
const imgRef = ref(null)
const displayWidth = ref(600)
const displayHeight = ref(400)
const editingLabelIndex = ref(-1)
const editingLabelValue = ref('')
const labelInputRef = ref(null)

const resizeHandles = ['nw', 'ne', 'sw', 'se']

// 拖拽/缩放状态
const dragState = ref(null)

function getScale() {
  const result = props.result
  if (!result?.imageSize) return { scaleX: 1, scaleY: 1 }
  return {
    scaleX: displayWidth.value / result.imageSize.width,
    scaleY: displayHeight.value / result.imageSize.height
  }
}

const bboxStyle = computed(() => {
  const result = props.result
  if (!result?.bbox) return {}
  const { scaleX, scaleY } = getScale()
  const b = result.bbox
  return {
    left: b.x * scaleX + 'px',
    top: b.y * scaleY + 'px',
    width: b.width * scaleX + 'px',
    height: b.height * scaleY + 'px'
  }
})

function getComponentBoxStyle(comp) {
  const result = props.result
  if (!result?.imageSize || !comp.bbox) return {}
  const imgSize = result.imageSize
  const scaleX = displayWidth.value / imgSize.width
  const scaleY = displayHeight.value / imgSize.height
  const b = comp.bbox
  const x = b.x * imgSize.width * scaleX
  const y = b.y * imgSize.height * scaleY
  const w = b.width * imgSize.width * scaleX
  const h = b.height * imgSize.height * scaleY
  return {
    left: x + 'px',
    top: y + 'px',
    width: w + 'px',
    height: h + 'px'
  }
}

function getHandleStyle(handle) {
  const pos = {
    nw: { left: '-5px', top: '-5px', cursor: 'nwse-resize' },
    ne: { right: '-5px', top: '-5px', cursor: 'nesw-resize' },
    sw: { left: '-5px', bottom: '-5px', cursor: 'nesw-resize' },
    se: { right: '-5px', bottom: '-5px', cursor: 'nwse-resize' }
  }
  return pos[handle] || {}
}

function onImageLoad() {
  if (!imgRef.value) return
  const maxW = containerRef.value?.clientWidth || 600
  const natW = imgRef.value.naturalWidth
  const natH = imgRef.value.naturalHeight
  const scale = Math.min(1, maxW / natW)
  displayWidth.value = Math.round(natW * scale)
  displayHeight.value = Math.round(natH * scale)
}

function onBoxMouseDown(e, type, compIndex) {
  if (e.button !== 0) return
  const rect = e.currentTarget.getBoundingClientRect()
  dragState.value = {
    type,
    compIndex,
    mode: 'drag',
    startX: e.clientX,
    startY: e.clientY,
    startLeft: rect.left - e.currentTarget.parentElement.getBoundingClientRect().left,
    startTop: rect.top - e.currentTarget.parentElement.getBoundingClientRect().top,
    startWidth: rect.width,
    startHeight: rect.height
  }
}

function onResizeStart(e, type, handle, compIndex) {
  if (e.button !== 0) return
  const box = e.target.parentElement
  const rect = box.getBoundingClientRect()
  const parentRect = box.parentElement.getBoundingClientRect()
  dragState.value = {
    type,
    compIndex,
    mode: 'resize',
    handle,
    startX: e.clientX,
    startY: e.clientY,
    startLeft: rect.left - parentRect.left,
    startTop: rect.top - parentRect.top,
    startWidth: rect.width,
    startHeight: rect.height
  }
}

function onOverlayMouseMove(e) {
  if (!dragState.value) return
  const state = dragState.value
  const dx = e.clientX - state.startX
  const dy = e.clientY - state.startY

  if (state.mode === 'drag') {
    applyDrag(state.startLeft + dx, state.startTop + dy, state.startWidth, state.startHeight, state.type, state.compIndex)
  } else if (state.mode === 'resize') {
    let { left, top, width, height } = {
      left: state.startLeft,
      top: state.startTop,
      width: state.startWidth,
      height: state.startHeight
    }
    const h = state.handle
    if (h.includes('e')) width = Math.max(20, width + dx)
    if (h.includes('w')) {
      width = Math.max(20, width - dx)
      left = state.startLeft + state.startWidth - width
    }
    if (h.includes('s')) height = Math.max(20, height + dy)
    if (h.includes('n')) {
      height = Math.max(20, height - dy)
      top = state.startTop + state.startHeight - height
    }
    applyDrag(left, top, width, height, state.type, state.compIndex)
  }
}

function onOverlayMouseUp() {
  dragState.value = null
}

function applyDrag(dispLeft, dispTop, dispWidth, dispHeight, type, compIndex) {
  const result = props.result
  if (!result?.imageSize) return
  const imgSize = result.imageSize
  const scaleX = displayWidth.value / imgSize.width
  const scaleY = displayHeight.value / imgSize.height

  if (type === 'bbox') {
    const bbox = {
      x: dispLeft / scaleX,
      y: dispTop / scaleY,
      width: dispWidth / scaleX,
      height: dispHeight / scaleY
    }
    emit('update:bbox', bbox)
  } else if (type === 'component' && result.components?.[compIndex]) {
    const comps = [...result.components]
    const normX = dispLeft / displayWidth.value
    const normY = dispTop / displayHeight.value
    const normW = dispWidth / displayWidth.value
    const normH = dispHeight / displayHeight.value
    comps[compIndex] = {
      ...comps[compIndex],
      bbox: { x: normX, y: normY, width: normW, height: normH }
    }
    emit('update:components', comps)
  }
}

function startEditLabel(index) {
  editingLabelIndex.value = index
  editingLabelValue.value = props.result?.components?.[index]?.name ?? ''
  nextTick(() => {
    const input = labelInputRef.value
    if (Array.isArray(input)) {
      input[index]?.focus()
    } else if (input) {
      input.focus()
    }
  })
}

function finishEditLabel() {
  const idx = editingLabelIndex.value
  // 从 input 元素直接读取当前值，解决 Enter 时 v-model 未及时更新的问题
  const input = labelInputRef.value
  const inputEl = Array.isArray(input) ? input?.[idx] : input
  const val = (inputEl ? String(inputEl.value || '').trim() : editingLabelValue.value?.trim()) || ''
  if (idx >= 0 && props.result?.components?.[idx] && val) {
    const comps = props.result.components.map((c, i) =>
      i === idx ? { ...c, name: val } : { ...c }
    )
    emit('update:components', comps)
  }
  editingLabelIndex.value = -1
  editingLabelValue.value = ''
}

function cancelEditLabel() {
  editingLabelIndex.value = -1
}

function onDuplicateComponent(index) {
  const comp = props.result?.components?.[index]
  if (!comp) return
  const comps = [...(props.result.components || [])]
  const bbox = comp.bbox ? { ...comp.bbox } : { x: 0.1, y: 0.1, width: 0.15, height: 0.15 }
  // 新框略微偏移，避免完全重叠
  const offset = 0.02
  const newComp = {
    ...comp,
    name: `${comp.name || '构件'} (副本)`,
    bbox: {
      x: Math.min(0.95, bbox.x + offset),
      y: Math.min(0.95, bbox.y + offset),
      width: bbox.width,
      height: bbox.height
    }
  }
  comps.splice(index + 1, 0, newComp)
  emit('update:components', comps)
}

watch(
  () => [props.result, props.showBbox, props.showComponents],
  () => {},
  { deep: true }
)

onMounted(() => {
  if (imgRef.value?.complete) onImageLoad()
})
</script>

<style lang="scss" scoped>
.annotator {
  position: relative;
}

.image-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);

  img {
    display: block;
    width: 100%;
    height: auto;
  }
}

.overlay-layer {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: auto;
}

.box {
  position: absolute;
  box-sizing: border-box;
  cursor: move;
  user-select: none;
  overflow: visible;

  &.bbox-box {
    border: 3px dashed rgba(201, 162, 39, 0.9);
    background: rgba(201, 162, 39, 0.05);
  }

  &.component-box {
    border: 2px solid hsl(220, 70%, 50%);
    background: hsla(220, 70%, 50%, 0.08);
  }
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #fff;
  border: 1px solid #333;
  border-radius: 2px;
  z-index: 2;
}

.component-label {
  position: absolute;
  left: 0;
  top: -22px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: text;

  input {
    width: 80px;
    padding: 0 4px;
    font-size: 12px;
    border: 1px solid var(--accent-primary);
    background: #fff;
    color: #333;
    outline: none;
  }
}

.legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;

  &.bbox {
    background: transparent;
    border: 2px solid var(--accent-gold);
  }

  &.component {
    background: hsl(220, 70%, 50%);
  }
}
</style>
