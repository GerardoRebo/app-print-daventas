export const removeVuetifyTableTabIndexes = () => {
  console.log("aewf");

  document.querySelectorAll('.v-data-table td[tabindex="0"]').forEach(el => {
    console.log("fv1r");

    el.removeAttribute('tabindex');
  });
  document.querySelectorAll('.v-data-table th[tabindex="0"]').forEach(el => {
    console.log("fv2r");
    el.removeAttribute('tabindex');
  });
  document.querySelectorAll('.v-data-table td[tabindex="0"]').forEach(el => {
    console.log("fv3r");
    el.removeAttribute('tabindex');
  });
}