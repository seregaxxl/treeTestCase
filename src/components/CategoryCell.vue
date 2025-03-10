<template>
    <div class="category-cell">
      <span class="category-text">{{ params.data.category }}</span>
        <button v-if="params.isEditMode" @click="handleAddChild(params.data.id)">➕</button>
        <button v-if="params.isEditMode" @click="handleRemoveItem(params.data.id)">❌</button>
    </div>
  </template>
  
  <script>

  export default {
    props: ['params'], 
    methods: {
    handleAddChild(parentId) {
      if (this.params.addChild) {
        this.params.addChild(parentId);
      }
    },
    handleRemoveItem(id) {
      console.log('removeItem called', this.params.removeItem, id);
      if (this.params.removeItem) {
        this.params.removeItem(id);
      }
    }
  },
  };
  </script>
  
  <style scoped>
  .category-cell {
    display: flex;
    justify-content: space-between; 
    align-items: center;
    width: 100%;
  }
  
  .category-text {
    flex-grow: 1;
  }
  
  .buttons-container {
    display: flex;
    gap: 10px; 
  }
  
  button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
  }
  </style>
  