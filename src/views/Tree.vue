<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import TreeStore from '../stores/treeStore';
import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
import { TreeDataModule, ClientSideRowModelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([TreeDataModule, ClientSideRowModelModule, AllCommunityModule]);

export default defineComponent({
  name: "App",
  components: {
    AgGridVue,
  },
  setup() {

    const rowData = ref([
      { id: 1, parent: null, label: 'Айтем 1' },
      { id: '2', parent: 1, label: 'Айтем 2' },
      { id: 3, parent: 1, label: 'Айтем 3' },
      { id: 4, parent: '2', label: 'Айтем 4' },
      { id: 5, parent: '2', label: 'Айтем 5' },
      { id: 6, parent: '2', label: 'Айтем 6' },
      { id: 7, parent: 4, label: 'Айтем 7' },
      { id: 8, parent: 4, label: 'Айтем 8' }
    ]);

    const getCategory = (id:any) => {
      const children = rowData.value.filter(item => item.parent === id);
      return children.length > 0 ? 'Группа' : 'Элемент';
    };

    const updatedRowData = rowData.value.map(item => ({
      ...item,
      category: getCategory(item.id),
    }));


    const colDefs = ref([
      { headerName: "№ п/п", valueGetter: "node.rowIndex + 1", width: 80 },
      { field: "label", editable: true },
    ]);

    

    const getDataPath = (data:any) => {
      return buildPath(data.id);
    };

    const buildPath:any = (id:any) => {
      const item = rowData.value.find((item) => item.id === id);
      if (!item) return [];
      const parentPath = item.parent ? buildPath(item.parent) : [];
      return [...parentPath, item.label];
    };

    // Auto group column definition for grouping behavior
    const autoGroupColumnDef = ref({
      headerName: 'Категория',
      field: "category",
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: {
        suppressCount: true,
      },
    });

    return {
      rowData,
      updatedRowData,
      colDefs,
      getDataPath,
      autoGroupColumnDef,
    };
  },
});
</script>

<template>
  <div>
    <button @click="toggleEditMode">{{ isEditMode ? 'Просмотр' : 'Редактирование' }}</button>
    <ag-grid-vue 
      style="width: 100%; height: 500px;"
      :columnDefs="colDefs"
      :rowData="updatedRowData"
      :treeData="true"
      :groupDefaultExpanded="-1"
      :autoGroupColumnDef="autoGroupColumnDef"
      :getDataPath="getDataPath"
      :editType="'individual'"
    />
  </div>
</template>
