// frontend/utils.js

// Example: Function to format date and time
function formatDateTime(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // January is 0
    const yy = String(date.getFullYear()).substr(-2);
    const time = String(date.getHours()).padStart(2, '0') + ':' +
                 String(date.getMinutes()).padStart(2, '0') + ':' +
                 String(date.getSeconds()).padStart(2, '0');
    return `${dd} ${mm} ${yy} ${time}`;
  }
  