export const removeVuetifyTableTabIndexes = () => {

  document.querySelectorAll('.v-data-table td[tabindex="0"]').forEach(el => {

    el.removeAttribute('tabindex');
  });
  document.querySelectorAll('.v-data-table th[tabindex="0"]').forEach(el => {
    el.removeAttribute('tabindex');
  });
  document.querySelectorAll('.v-data-table td[tabindex="0"]').forEach(el => {
    el.removeAttribute('tabindex');
  });
}