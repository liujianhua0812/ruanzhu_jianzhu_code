<template>
  <div class="result-card">
    <h3 class="card-title">识别结果</h3>

    <div class="section" v-if="result?.buildingType">
      <h4>建筑类型</h4>
      <div class="type-badge">
        <span
          v-if="editing !== 'btName'"
          class="name editable"
          @dblclick="startEdit('btName', result.buildingType.name)"
        >{{ result.buildingType.name }}</span>
        <input
          v-else
          ref="editInputRef"
          type="text"
          class="edit-input"
          :value="editValue"
          @input="editValue = $event.target.value"
          @blur="commitEdit"
          @keydown.enter.prevent="commitEdit"
          @keydown.esc="cancelEdit"
        />
        <el-progress
          :percentage="Math.round((result.buildingType.confidence || 0) * 100)"
          :stroke-width="8"
          :show-text="false"
        />
        <span class="conf">{{ Math.round((result.buildingType.confidence || 0) * 100) }}%</span>
      </div>
      <p
        v-if="editing !== 'btDesc'"
        class="desc editable"
        @dblclick="startEdit('btDesc', result.buildingType.desc)"
      >{{ result.buildingType.desc }}</p>
      <input
        v-else
        ref="editInputRef"
        type="text"
        class="edit-input block"
        :value="editValue"
        @input="editValue = $event.target.value"
        @blur="commitEdit"
        @keydown.enter.prevent="commitEdit"
        @keydown.esc="cancelEdit"
      />
    </div>

    <div class="section" v-if="result?.styles">
      <h4>建筑风格</h4>
      <div class="style-tags">
        <el-tag
          v-if="editing !== 'styleRegion'"
          type="info"
          size="small"
          class="editable"
          @dblclick="startEdit('styleRegion', result.styles.region?.name)"
        >{{ result.styles.region?.name || '-' }}</el-tag>
        <input
          v-else
          ref="editInputRef"
          type="text"
          class="edit-input tag-size"
          :value="editValue"
          @input="editValue = $event.target.value"
          @blur="commitEdit"
          @keydown.enter.prevent="commitEdit"
          @keydown.esc="cancelEdit"
        />
        <el-tag
          v-if="editing !== 'styleDynasty'"
          type="warning"
          size="small"
          class="editable"
          @dblclick="startEdit('styleDynasty', result.styles.dynasty?.name)"
        >{{ result.styles.dynasty?.name || '-' }}</el-tag>
        <input
          v-else
          ref="editInputRef"
          type="text"
          class="edit-input tag-size"
          :value="editValue"
          @input="editValue = $event.target.value"
          @blur="commitEdit"
          @keydown.enter.prevent="commitEdit"
          @keydown.esc="cancelEdit"
        />
        <el-tag
          v-if="editing !== 'styleEthnic'"
          size="small"
          class="editable"
          @dblclick="startEdit('styleEthnic', result.styles.ethnic?.name)"
        >{{ result.styles.ethnic?.name || '-' }}</el-tag>
        <input
          v-else
          ref="editInputRef"
          type="text"
          class="edit-input tag-size"
          :value="editValue"
          @input="editValue = $event.target.value"
          @blur="commitEdit"
          @keydown.enter.prevent="commitEdit"
          @keydown.esc="cancelEdit"
        />
      </div>
    </div>

    <div class="section evidence" v-if="result?.evidence?.length">
      <h4>判定依据</h4>
      <div class="evidence-list">
        <div v-for="(e, i) in result.evidence" :key="i" class="evidence-item">
          <span
            v-if="editing !== `evRegion_${i}`"
            class="region editable"
            @dblclick="startEdit(`evRegion_${i}`, e.region, i)"
          >{{ e.region }}</span>
          <input
            v-else
            ref="editInputRef"
            type="text"
            class="edit-input inline"
            :value="editValue"
            @input="editValue = $event.target.value"
            @blur="commitEdit"
            @keydown.enter.prevent="commitEdit"
            @keydown.esc="cancelEdit"
          />
          <span
            v-if="editing !== `evDesc_${i}`"
            class="desc editable"
            @dblclick="startEdit(`evDesc_${i}`, e.desc, i)"
          >{{ e.desc }}</span>
          <input
            v-else
            ref="editInputRef"
            type="text"
            class="edit-input inline flex"
            :value="editValue"
            @input="editValue = $event.target.value"
            @blur="commitEdit"
            @keydown.enter.prevent="commitEdit"
            @keydown.esc="cancelEdit"
          />
        </div>
      </div>
    </div>

    <div class="section" v-if="result?.culturalFeatures">
      <h4>文化特征</h4>
      <div class="cultural-grid">
        <div class="item">
          <span class="label">对称性</span>
          <span
            v-if="editing !== 'cfSymmetry'"
            class="editable"
            @dblclick="startEdit('cfSymmetry', result.culturalFeatures.symmetry)"
          >{{ result.culturalFeatures.symmetry }}</span>
          <input
            v-else
            ref="editInputRef"
            type="text"
            class="edit-input inline"
            :value="editValue"
            @input="editValue = $event.target.value"
            @blur="commitEdit"
            @keydown.enter.prevent="commitEdit"
            @keydown.esc="cancelEdit"
          />
        </div>
        <div class="item">
          <span class="label">开间</span>
          <span
            v-if="editing !== 'cfBays'"
            class="editable"
            @dblclick="startEdit('cfBays', result.culturalFeatures.bays)"
          >{{ result.culturalFeatures.bays }} 间</span>
          <input
            v-else
            ref="editInputRef"
            type="text"
            class="edit-input inline"
            :value="editValue"
            @input="editValue = $event.target.value"
            @blur="commitEdit"
            @keydown.enter.prevent="commitEdit"
            @keydown.esc="cancelEdit"
          />
        </div>
        <div class="item">
          <span class="label">屋顶坡度</span>
          <span
            v-if="editing !== 'cfRoofSlope'"
            class="editable"
            @dblclick="startEdit('cfRoofSlope', result.culturalFeatures.roofSlope)"
          >{{ result.culturalFeatures.roofSlope }}</span>
          <input
            v-else
            ref="editInputRef"
            type="text"
            class="edit-input inline"
            :value="editValue"
            @input="editValue = $event.target.value"
            @blur="commitEdit"
            @keydown.enter.prevent="commitEdit"
            @keydown.esc="cancelEdit"
          />
        </div>
        <div class="item">
          <span class="label">主色调</span>
          <span
            v-if="editing !== 'cfMainColor'"
            class="editable"
            @dblclick="startEdit('cfMainColor', result.culturalFeatures.mainColor)"
          >{{ result.culturalFeatures.mainColor }}</span>
          <input
            v-else
            ref="editInputRef"
            type="text"
            class="edit-input inline"
            :value="editValue"
            @input="editValue = $event.target.value"
            @blur="commitEdit"
            @keydown.enter.prevent="commitEdit"
            @keydown.esc="cancelEdit"
          />
        </div>
        <div class="item">
          <span class="label">社会等级</span>
          <span
            v-if="editing !== 'cfSocialLevel'"
            class="editable"
            @dblclick="startEdit('cfSocialLevel', result.culturalFeatures.socialLevel)"
          >{{ result.culturalFeatures.socialLevel }}</span>
          <input
            v-else
            ref="editInputRef"
            type="text"
            class="edit-input inline"
            :value="editValue"
            @input="editValue = $event.target.value"
            @blur="commitEdit"
            @keydown.enter.prevent="commitEdit"
            @keydown.esc="cancelEdit"
          />
        </div>
        <div class="item">
          <span class="label">功能属性</span>
          <span
            v-if="editing !== 'cfFunction'"
            class="editable"
            @dblclick="startEdit('cfFunction', result.culturalFeatures.function)"
          >{{ result.culturalFeatures.function }}</span>
          <input
            v-else
            ref="editInputRef"
            type="text"
            class="edit-input inline"
            :value="editValue"
            @input="editValue = $event.target.value"
            @blur="commitEdit"
            @keydown.enter.prevent="commitEdit"
            @keydown.esc="cancelEdit"
          />
        </div>
      </div>
    </div>

    <div class="section summary" v-if="result?.summary">
      <h4>文化解读摘要</h4>
      <p
        v-if="editing !== 'summary'"
        class="editable"
        @dblclick="startEdit('summary', result.summary)"
      >{{ result.summary }}</p>
      <textarea
        v-else
        ref="editInputRef"
        class="edit-input block textarea"
        :value="editValue"
        @input="editValue = $event.target.value"
        @blur="commitEdit"
        @keydown.enter.ctrl.prevent="commitEdit"
        @keydown.esc="cancelEdit"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  result: Object
})

const emit = defineEmits(['update'])

const editing = ref('')
const editValue = ref('')
const editExtra = ref(null) // 用于 evidence 的 index
const editInputRef = ref(null)

function startEdit(key, value, extra) {
  editing.value = key
  editValue.value = value ?? ''
  editExtra.value = extra
  nextTick(() => {
    const el = editInputRef.value
    const target = Array.isArray(el) ? el[0] : el
    target?.focus()
  })
}

function cancelEdit() {
  editing.value = ''
  editValue.value = ''
  editExtra.value = null
}

function commitEdit() {
  const key = editing.value
  const val = String(editValue.value ?? '').trim()
  const result = props.result
  if (!result) {
    cancelEdit()
    return
  }

  if (key === 'btName' && val) {
    emit('update', { buildingType: { name: val } })
  } else if (key === 'btDesc') {
    emit('update', { buildingType: { desc: val } })
  } else if (key === 'styleRegion') {
    emit('update', { styles: { region: { name: val || result.styles?.region?.name } } })
  } else if (key === 'styleDynasty') {
    emit('update', { styles: { dynasty: { name: val || result.styles?.dynasty?.name } } })
  } else if (key === 'styleEthnic') {
    emit('update', { styles: { ethnic: { name: val || result.styles?.ethnic?.name } } })
  } else if (key?.startsWith('evRegion_') && val !== undefined) {
    const i = editExtra.value
    const evidence = [...(result.evidence || [])]
    if (evidence[i]) {
      evidence[i] = { ...evidence[i], region: val }
      emit('update', { evidence })
    }
  } else if (key?.startsWith('evDesc_') && val !== undefined) {
    const i = editExtra.value
    const evidence = [...(result.evidence || [])]
    if (evidence[i]) {
      evidence[i] = { ...evidence[i], desc: val }
      emit('update', { evidence })
    }
  } else if (key === 'cfSymmetry') {
    emit('update', { culturalFeatures: { symmetry: val } })
  } else if (key === 'cfBays') {
    emit('update', { culturalFeatures: { bays: val } })
  } else if (key === 'cfRoofSlope') {
    emit('update', { culturalFeatures: { roofSlope: val } })
  } else if (key === 'cfMainColor') {
    emit('update', { culturalFeatures: { mainColor: val } })
  } else if (key === 'cfSocialLevel') {
    emit('update', { culturalFeatures: { socialLevel: val } })
  } else if (key === 'cfFunction') {
    emit('update', { culturalFeatures: { function: val } })
  } else if (key === 'summary') {
    emit('update', { summary: val })
  }

  cancelEdit()
}
</script>

<style lang="scss" scoped>
.result-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid var(--border-color);
}

.card-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--accent-primary);
}

.section {
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }

  h4 {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }
}

.editable {
  cursor: text;
  border-radius: 4px;
  padding: 1px 2px;
  &:hover {
    background: rgba(139, 69, 19, 0.08);
  }
}

.edit-input {
  font-size: inherit;
  font-family: inherit;
  border: 1px solid var(--accent-primary);
  border-radius: 4px;
  padding: 2px 6px;
  outline: none;
  background: #fff;
  color: var(--text-primary);

  &.inline {
    display: inline;
    min-width: 60px;
  }

  &.block {
    display: block;
    width: 100%;
    margin-top: 0.25rem;
  }

  &.tag-size {
    width: 80px;
    padding: 2px 8px;
    font-size: 12px;
  }

  &.textarea {
    min-height: 80px;
    resize: vertical;
  }

  &.flex {
    flex: 1;
    min-width: 120px;
  }
}

.type-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;

  .name {
    font-weight: 600;
    min-width: 80px;
  }

  .el-progress {
    flex: 1;
    max-width: 120px;
  }

  .conf {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
}

.desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.style-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.evidence-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.evidence-item {
  padding: 0.5rem;
  background: rgba(139, 69, 19, 0.05);
  border-radius: 6px;
  font-size: 0.9rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;

  .region {
    display: inline-block;
    font-weight: 500;
    color: var(--accent-primary);
    margin-right: 0.25rem;
  }
}

.cultural-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  font-size: 0.9rem;

  .label {
    display: inline-block;
    color: var(--text-secondary);
    margin-right: 0.5rem;
    min-width: 70px;
  }

  .item {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
}

.summary p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-primary);
}
</style>
