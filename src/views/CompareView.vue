<template>
  <div class="compare-view">
    <h1 class="page-title">建筑对比与演化分析</h1>

    <div v-if="compareList.length < 2" class="empty-compare">
      <el-icon><Switch /></el-icon>
      <p>请从「建筑识别」页面将至少 2 个建筑加入对比</p>
      <el-button type="primary" @click="$router.push('/recognize')">前往识别</el-button>
    </div>

    <template v-else>
      <div class="compare-grid" :style="{ gridTemplateColumns: `repeat(${compareList.length}, 1fr)` }">
        <div v-for="item in compareList" :key="item.id" class="compare-card">
          <div class="compare-image">
            <img :src="item.url" alt="" />
            <span
              v-if="editing !== `${item.id}_typeTag`"
              class="type-tag editable"
              @dblclick="startEdit(item.id, 'typeTag', item.result?.buildingType?.name)"
            >{{ item.result?.buildingType?.name }}</span>
            <input
              v-else
              ref="editInputRef"
              type="text"
              class="edit-input type-tag-input"
              :value="editValue"
              @input="editValue = $event.target.value"
              @blur="commitEdit"
              @keydown.enter.prevent="commitEdit"
              @keydown.esc="cancelEdit"
            />
          </div>
          <div class="compare-detail">
            <h4>类型</h4>
            <p v-if="editing !== `${item.id}_type`">
              <span
                class="editable"
                @dblclick="startEdit(item.id, 'type', item.result?.buildingType?.name)"
              >{{ item.result?.buildingType?.name }}</span>
              ({{ Math.round((item.result?.buildingType?.confidence || 0) * 100) }}%)
            </p>
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
            <h4>地域风格</h4>
            <p v-if="editing !== `${item.id}_region`">
              <span
                class="editable"
                @dblclick="startEdit(item.id, 'region', item.result?.styles?.region?.name)"
              >{{ item.result?.styles?.region?.name || '-' }}</span>
            </p>
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
            <h4>朝代风格</h4>
            <p v-if="editing !== `${item.id}_dynasty`">
              <span
                class="editable"
                @dblclick="startEdit(item.id, 'dynasty', item.result?.styles?.dynasty?.name)"
              >{{ item.result?.styles?.dynasty?.name || '-' }}</span>
            </p>
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
            <h4>文化特征</h4>
            <p v-if="editing !== `${item.id}_symmetry`">
              对称性: <span
                class="editable"
                @dblclick="startEdit(item.id, 'symmetry', item.result?.culturalFeatures?.symmetry)"
              >{{ item.result?.culturalFeatures?.symmetry || '-' }}</span>
            </p>
            <p v-else>
              对称性: <input
                ref="editInputRef"
                type="text"
                class="edit-input inline"
                :value="editValue"
                @input="editValue = $event.target.value"
                @blur="commitEdit"
                @keydown.enter.prevent="commitEdit"
                @keydown.esc="cancelEdit"
              />
            </p>
            <p v-if="editing !== `${item.id}_bays`">
              开间: <span
                class="editable"
                @dblclick="startEdit(item.id, 'bays', item.result?.culturalFeatures?.bays)"
              >{{ item.result?.culturalFeatures?.bays }} 间</span>
            </p>
            <p v-else>
              开间: <input
                ref="editInputRef"
                type="text"
                class="edit-input inline"
                :value="editValue"
                @input="editValue = $event.target.value"
                @blur="commitEdit"
                @keydown.enter.prevent="commitEdit"
                @keydown.esc="cancelEdit"
              /> 间
            </p>
            <p v-if="editing !== `${item.id}_mainColor`">
              主色调: <span
                class="editable"
                @dblclick="startEdit(item.id, 'mainColor', item.result?.culturalFeatures?.mainColor)"
              >{{ item.result?.culturalFeatures?.mainColor || '-' }}</span>
            </p>
            <p v-else>
              主色调: <input
                ref="editInputRef"
                type="text"
                class="edit-input inline"
                :value="editValue"
                @input="editValue = $event.target.value"
                @blur="commitEdit"
                @keydown.enter.prevent="commitEdit"
                @keydown.esc="cancelEdit"
              />
            </p>
            <el-button size="small" text @click="removeCompare(item.id)">移除</el-button>
          </div>
        </div>
      </div>

      <div class="evolution-timeline">
        <h3>风格演化时间轴</h3>
        <div class="timeline">
          <div
            v-for="(item, i) in compareList"
            :key="item.id"
            class="timeline-item"
          >
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span
                v-if="editing !== `${item.id}_tlDynasty`"
                class="dynasty editable"
                @dblclick="startEdit(item.id, 'tlDynasty', item.result?.styles?.dynasty?.name)"
              >{{ item.result?.styles?.dynasty?.name || '未知' }}</span>
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
                v-if="editing !== `${item.id}_tlType`"
                class="type editable"
                @dblclick="startEdit(item.id, 'tlType', item.result?.buildingType?.name)"
              >{{ item.result?.buildingType?.name }}</span>
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
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { Switch } from '@element-plus/icons-vue'
import { useArchitectureStore } from '@/stores/architectureStore'

const store = useArchitectureStore()

const editing = ref('')
const editValue = ref('')
const editItemId = ref('')
const editField = ref('')
const editInputRef = ref(null)

const compareList = computed(() =>
  store.compareItems
    .map(id => store.getImageById(id))
    .filter(Boolean)
)

function startEdit(itemId, field, value) {
  editing.value = `${itemId}_${field}`
  editItemId.value = itemId
  editField.value = field
  editValue.value = value ?? ''
  nextTick(() => {
    const el = editInputRef.value
    const target = Array.isArray(el) ? el.find(Boolean) : el
    target?.focus()
  })
}

function cancelEdit() {
  editing.value = ''
  editValue.value = ''
  editItemId.value = ''
  editField.value = ''
}

function commitEdit() {
  const itemId = editItemId.value
  const field = editField.value
  const val = String(editValue.value ?? '').trim()
  if (!itemId) {
    cancelEdit()
    return
  }

  const updates = {}
  if (field === 'typeTag' || field === 'type' || field === 'tlType') {
    updates.buildingType = { name: val }
  } else if (field === 'region') {
    updates.styles = { region: { name: val } }
  } else if (field === 'dynasty' || field === 'tlDynasty') {
    updates.styles = { dynasty: { name: val } }
  } else if (field === 'symmetry') {
    updates.culturalFeatures = { symmetry: val }
  } else if (field === 'bays') {
    updates.culturalFeatures = { bays: val }
  } else if (field === 'mainColor') {
    updates.culturalFeatures = { mainColor: val }
  }

  if (Object.keys(updates).length) {
    store.updateImageResult(itemId, updates)
  }
  cancelEdit()
}

function removeCompare(id) {
  store.removeFromCompare(id)
}
</script>

<style lang="scss" scoped>
.compare-view {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.empty-compare {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);

  .el-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  p {
    margin-bottom: 1rem;
  }
}

.compare-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.compare-card {
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.compare-image {
  position: relative;
  height: 200px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .type-tag {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
    background: rgba(0,0,0,0.7);
    color: #fff;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;

    &.editable {
      cursor: text;
      &:hover { background: rgba(0,0,0,0.85); }
    }
  }

  .type-tag-input {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
    width: 100px;
    padding: 0.25rem 0.5rem;
    font-size: 0.85rem;
  }
}

.compare-detail {
  padding: 1rem;

  h4 {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0.5rem 0 0.25rem;

    &:first-child {
      margin-top: 0;
    }
  }

  p {
    font-size: 0.9rem;
    margin: 0;
  }

  .editable {
    cursor: text;
    border-radius: 4px;
    padding: 1px 2px;
    &:hover { background: rgba(139, 69, 19, 0.08); }
  }

  .edit-input {
    font-size: 0.9rem;
    border: 1px solid var(--accent-primary);
    border-radius: 4px;
    padding: 2px 6px;
    outline: none;
    width: 100%;
    margin: 0.25rem 0;

    &.inline {
      display: inline;
      width: auto;
      min-width: 60px;
      margin: 0;
    }
  }
}

.evolution-timeline {
  padding: 1.5rem;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);

  h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
}

.timeline {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent-primary);
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  .dynasty {
    font-weight: 600;
    color: var(--accent-primary);
  }

  .type {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .editable {
    cursor: text;
    border-radius: 4px;
    padding: 1px 2px;
    &:hover { background: rgba(139, 69, 19, 0.08); }
  }

  .edit-input {
    font-size: inherit;
    font-family: inherit;
    border: 1px solid var(--accent-primary);
    border-radius: 4px;
    padding: 2px 6px;
    outline: none;
    min-width: 60px;

    &.inline {
      display: inline;
    }
  }
}
</style>
