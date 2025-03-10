<script lang="ts">
import { defineComponent, ref, watch, computed, onMounted, type Ref } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { TreeDataModule, ClientSideRowModelModule } from 'ag-grid-enterprise';
import CategoryCell from '../components/CategoryCell.vue';
import { TreeStore } from '../stores/treeStore';

ModuleRegistry.registerModules([TreeDataModule, ClientSideRowModelModule, AllCommunityModule]);

interface Item {
  id: string | number;
  parent: string | number | null;
  label: string;
}

export default defineComponent({
  name: "App",
  components: { AgGridVue },
  setup() {
    const treeStore = ref<TreeStore>(new TreeStore(initialData));

    const isEditMode = ref<boolean>(true);

    const toggleEditMode = () => { isEditMode.value = !isEditMode.value; };

    const canUndo = computed(() => treeStore.value.historyIndex >= 0); 
    const canRedo = computed(() => treeStore.value.historyIndex < treeStore.value.history.length - 1); 

    const addChild = (parentId: string | number) => {
      const newItem: Item = createNewItem(parentId);
      treeStore.value.addItem(newItem);
    };

    const removeItem = (id: string | number) => treeStore.value.removeItem(id);

    const onCellValueChanged = (params: { data: Item }) => {
      treeStore.value.updateItem(params.data); 
    };

    const getCategory = (id: string | number): string => {
      return treeStore.value.getChildren(id).length > 0 ? 'Группа' : 'Элемент';
    };

    const updatedRowData = computed(() => {
      return treeStore.value.getAll().map(item => ({ ...item, category: getCategory(item.id) }));
    });

    const getDataPath = (data: Item) => buildPath(data.id, treeStore.value as TreeStore);

    const colDefs = ref([
      { headerName: "№ п/п", valueGetter: "node.rowIndex + 1", width: 80 },
      { field: "label", editable: false },
    ]);

    const autoGroupColumnDef = createAutoGroupColumnDef(addChild, removeItem, isEditMode);

    const undo = () => treeStore.value.undo();
    const redo = () => treeStore.value.redo();

    watch(isEditMode, () => updateColumnDefs(isEditMode.value, colDefs));

    onMounted(() => {
      isEditMode.value = false; 
    });

    return {
      treeStore,
      colDefs,
      isEditMode,
      toggleEditMode,
      addChild,
      removeItem,
      updatedRowData,
      autoGroupColumnDef,
      getDataPath,
      canUndo,
      canRedo,
      undo,
      redo,
      onCellValueChanged,
    };
  },
});

const initialData = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '2', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '2', label: 'Айтем 4' },
  { id: 5, parent: '2', label: 'Айтем 5' },
  { id: 6, parent: '2', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
];

const createNewItem = (parentId: string | number): Item => ({
  id: Date.now(),
  parent: parentId,
  label: 'Новый элемент'
});

const buildPath = (id: string | number, treeStore: TreeStore): string[] => {
  const item = treeStore.getItem(id);
  if (!item) return [];
  return [...(item.parent ? buildPath(item.parent, treeStore) : []), item.label];
};

const createAutoGroupColumnDef = (addChild: (parentId: string | number) => void, removeItem: (id: string | number) => void, isEditMode: Ref<boolean>) => ({
  headerName: 'Категория',
  field: 'category',
  cellRenderer: 'agGroupCellRenderer',
  cellRendererParams: {
    suppressCount: true,
    suppressPadding: true,
    innerRenderer: CategoryCell, 
    innerRendererParams: {
      addChild,
      removeItem,
      isEditMode,
    },
    width: 600,
  },
});

const updateColumnDefs = (isEditMode: boolean, colDefs: Ref<any[]>) => {
  colDefs.value = colDefs.value.map(col => {
    if (col.field === "label") {
      return { ...col, editable: isEditMode };
    }
    return col;
  });
};
</script>

<template>
  <div class="container">
    <button @click="toggleEditMode">{{ isEditMode ? 'Просмотр' : 'Редактирование' }}</button>
    <button :disabled="!canUndo" @click="undo">←</button>
    <button :disabled="!canRedo" @click="redo">→</button>

    <ag-grid-vue 
      style="width: 100%; height: 500px;"
      :columnDefs="colDefs"
      :rowData="updatedRowData"
      :treeData="true"
      :groupDefaultExpanded="-1"
      :autoGroupColumnDef="autoGroupColumnDef"
      :getDataPath="getDataPath"
      @cellValueChanged="onCellValueChanged"
    />
  </div>
</template>

<style scoped>
.container {
width: 80vw;
}
</style>
