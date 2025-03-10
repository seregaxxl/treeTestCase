<script>
import { AgGridVue } from 'ag-grid-vue3';
import TreeStore from '../stores/treeStore';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
import { TreeDataModule, ClientSideRowModelModule } from 'ag-grid-enterprise'; 

ModuleRegistry.registerModules([ TreeDataModule, ClientSideRowModelModule, AllCommunityModule ]); 

export default {
  components: { AgGridVue },
  data() {
    return {
      isEditMode: true,
      treeStore: new TreeStore([
        { id: 1, parent: null, label: 'Айтем 1' },
        { id: '2', parent: 1, label: 'Айтем 2' },
        { id: 3, parent: 1, label: 'Айтем 3' },
        { id: 4, parent: '2', label: 'Айтем 4' },
        { id: 5, parent: '2', label: 'Айтем 5' },
        { id: 6, parent: '2', label: 'Айтем 6' },
        { id: 7, parent: 4, label: 'Айтем 7' },
        { id: 8, parent: 4, label: 'Айтем 8' }
      ]),
      columnDefs: [
        { headerName: "№", valueGetter: "node.rowIndex + 1", width: 80 },
        {
          field: 'label',
          headerName: 'Название',
          editable: true
        },
      ],
      autoGroupColumnDef: {
        headerName: 'Категория',
        field: 'category',
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          suppressCount: true,
        },
      },
    };
  },
  computed: {
    rowData() {
      return this.treeStore.getAll().map(item => ({
        ...item,
        category: this.treeStore.getChildren(item.id).length > 0 ? 'Группа' : 'Элемент'
      }));
    },
    canUndo() {
      return this.treeStore.historyIndex > 0;
    },
    canRedo() {
      return this.treeStore.historyIndex < this.treeStore.history.length - 1;
    }
  },
  methods: {
    toggleEditMode() {
      this.isEditMode = !this.isEditMode;
    },
    onCellValueChanged(params) {
      this.treeStore.updateItem(params.data);
    },
    undo() {
      this.treeStore.undo();
    },
    redo() {
      this.treeStore.redo();
    },
    addChild(parentId) {
      const newItem = { id: Date.now(), parent: parentId, label: 'Новый элемент' };
      this.treeStore.addItem(newItem);
    },
    removeItem(id) {
      this.treeStore.removeItem(id);
    },
    getDataPath(data) {
      return this.buildPath(data.id);
    },
    buildPath(id) {
      const item = this.treeStore.getItem(id);
      if (!item) return [];
      const parentPath = item.parent ? this.buildPath(item.parent) : [];
      return [...parentPath, item.label];
    }
  }
};
</script>

<template>
  <div>
    <button @click="toggleEditMode">{{ isEditMode ? 'Просмотр' : 'Редактирование' }}</button>
    <button @click="undo" :disabled="!canUndo">⏪</button>
    <button @click="redo" :disabled="!canRedo">⏩</button>
    <ag-grid-vue 
      style="width: 100%; height: 500px;"
      :columnDefs="columnDefs"
      :rowData="rowData"
      :treeData="true"
      :groupDefaultExpanded="-1"
      :autoGroupColumnDef="autoGroupColumnDef"
      :getDataPath="getDataPath"
      :frameworkComponents="frameworkComponents"
      :editType="'individual'"
      @cellValueChanged="onCellValueChanged"
    >
    </ag-grid-vue>
  </div>
</template>
