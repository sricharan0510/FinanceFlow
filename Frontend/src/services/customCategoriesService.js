// Service for custom categories (localStorage)
const STORAGE_KEY = 'customCategories';

export const customCategoriesService = {
  getCategories() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  },
  addCategory(category) {
    const cats = customCategoriesService.getCategories();
    if (!cats.includes(category)) {
      cats.push(category);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
    }
  },
  removeCategory(category) {
    const cats = customCategoriesService.getCategories().filter(c => c !== category);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
  }
};
