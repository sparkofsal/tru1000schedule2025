const sheetID = '1fnOGM1YZ2XB0JbomEcZl5JLt6XZnXjVpDJS0Z-9JsgU'; // Replace with whatever is between /d/ and /edit from my google sheets main URL //
const gid = '1460359088'; // Replace the  GID number with the gid TAB I want to load, it is the number at the end of the URL after gid= in the URL of the tab I want to load //
const visibleColumns = [2, 3, 4, 5, 6, 9, 10, 11, 12]; // this is the columns I want to show, the first column is 0, the second is 1, etc. //
const tableHeaders = document.getElementById('table-headers');
const tableRows = document.getElementById('table-rows');
const scrollContent = document.getElementById('scroll-content');
const headerRow = document.getElementById('table-headers');

function updateClock() {
  const now = new Date();
  document.getElementById('datetime').textContent = now.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

async function loadSchedule() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?gid=${gid}&tqx=out:json&cacheBuster=${Date.now()}`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));

    const rows = json.table.rows;
    const cols = json.table.cols;

    // Build headers
    headerRow.innerHTML = visibleColumns.map(i => `<th>${cols[i].label}</th>`).join(''); // Create header row based on visible columns //

    // This is the function that creates a formatted row based on the visible columns //
    function createFormattedRow(rowData) {
  const tr = document.createElement('tr');
  visibleColumns.forEach((i, visibleIndex) => {
    const cell = rowData.c[i];
    const td = document.createElement('td');
    let value = cell?.v ?? '';

    // Format only columns 10 and 11 (visibleIndex 6 and 7)
    const shouldFormatAsDate = (visibleIndex === 6 || visibleIndex === 7);

    if (shouldFormatAsDate && value) {
      if (typeof value === 'string' && /^Date\(\d+,\d+,\d+\)$/.test(value)) {
        const [, y, m, d] = value.match(/Date\((\d+),(\d+),(\d+)\)/).map(Number);
        const date = new Date(y, m, d);
        value = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      } else if (typeof value === 'number') {
        // Google Sheets sometimes gives Excel serial numbers — convert it
        const excelEpoch = new Date(1899, 11, 30); // Excel's "zero" date
        const date = new Date(excelEpoch.getTime() + value * 86400000);
        value = date.toLocaleDateString('en-US', {
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
});

      } else if (value instanceof Date) {
        value = value.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
    }

    td.textContent = value;
    tr.appendChild(td);
  });

  return tr;
}


    scrollContent.innerHTML = '';
    rows.forEach(row => {
      // this part checks if the row has any data in the visible columns, if all visible cells are empty, the row is skipped //
      const hasData = visibleColumns.some(i => {
        const cell = row.c[i];
        return cell && cell.v !== null && cell.v !== '';
      });

      if (hasData) {
        scrollContent.appendChild(createFormattedRow(row));
      }
    });

  } catch (err) {
    scrollContent.innerHTML = '<tr><td colspan="100%">⚠️ Failed to load schedule.</td></tr>';
    console.error('Error loading schedule:', err);
  }
}

loadSchedule();
updateClock();
setInterval(loadSchedule, 3 * 60 * 1000);
setInterval(updateClock, 1000);
