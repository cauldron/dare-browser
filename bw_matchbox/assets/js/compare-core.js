/* global commonHelpers, compareRowsHelpers, compareRowClick */

/* Compare tables feature code (via global variable `compareCore`).
 *
 * Mouse handler methods are used:
 * - compareRowsHelpers.clickRow -- Click on regular row to select or collapse selected rows.
 * - compareRowsHelpers.clickUncollapseRow -- Click on collapsed row handler to uncollapse.
 * - compareRowClick.disableRowClick -- To disable row click effect (if we have some nested interactive elements).
 * - compareCore.removeRow
 * - compareCore.expandRow
 * - compareCore.editNumber
 * - compareCore.shiftRow
 * - compareCore.replaceAmountRow
 * - compareCore.setNumber
 * - compareCore.setNewNumber
 * - compareCore.rescaleAmount
 * - compareCore.replaceWithTarget
 *
 * Data table record types:
 *
 * interface TDataRecord {
 *   amount: number; // 7.135225509515751e-9
 *   amount_display: string; // "7.1e-09"
 *   input_id: number; // 633
 *   location: string; // "United States"
 *   name: string; // "Clothing; at manufacturer"
 *   row_id: string; // "0"
 *   unit: string; // ""
 *   url: string; // "/process/633"
 * }
 */

// global module variable
const compareCore = {
  // External data...
  sharedData: undefined, // Initializing in `compareCore.initCompare` from `bw_matchbox/assets/templates/compare.html`

  // Local data...
  comment: '',
  modal: undefined, // HTMLDivElement -- modal window node

  // Methods...

  shiftRow: function (event, row, row_id) {
    compareRowClick.disableRowClick();
    // Add row from source to target array
    event.preventDefault();
    row.parentElement.parentElement.classList.add('shift-right');
    var obj = compareCore.sharedData.source_data.find((item) => item.row_id == row_id);
    compareCore.sharedData.target_data.push(obj);
    compareCore.build_table('target-table', compareCore.sharedData.target_data, true);
    compareCore.comment += `* Added source exchange of ${obj.amount} ${obj.unit} ${obj.name} in ${obj.location}.\n`;
    row.parentElement.innerHTML = `<i class="fa-solid fa-check"></i>`;
  },

  build_row: function (data, is_target) {
    const rowId = data.row_id;
    const rowKind = is_target ? 'target' : 'source';
    const collapsedId = compareRowsHelpers.getCollapsedId(rowKind, rowId);
    // Detect if row is collapsed, then render correspound class (`collapsed`) and append handler node...
    const isCollapsed = !!compareRowsHelpers.collapsedRows[collapsedId];
    const collapsedRowHtml =
      isCollapsed && compareRowsHelpers.buildCollapsedHandlerRow(rowKind, rowId, data);
    // Create class name...
    const className = [isCollapsed && 'collapsed'].filter(Boolean).join(' ');
    const attrs = [['class', className], isCollapsed && ['collapsed-id', collapsedId]]
      .filter(Boolean)
      .map(([name, value]) => value && name + '="' + commonHelpers.quoteHtmlAttr(value) + '"')
      .filter(Boolean)
      .join(' ');
    const start = `<tr
      ${attrs}
      row_id="${data.row_id}"
      onClick="compareRowsHelpers.clickRow(this)"
    >`;
    const end = `<td><a onClick="compareRowClick.disableRowClick(this)" href="${data.url}">${data.name}</a></td><td>${data.location}</td><td>${data.unit}</td></tr>`;
    let content;
    if (is_target) {
      content = `
  <td row_id="${data.row_id}">
    <span id="row-trash-${data.row_id}" onClick="compareCore.removeRow(this)"><a><i class="fa-solid fa-trash-can"></i></a></span>
    |
    <span onClick="compareCore.expandRow(this)" input_id="${data.input_id}" amount="${data.amount}"><a><i class="fa-solid fa-diamond fa-spin"></i></a></span>
  </td>
  <td onClick="compareCore.editNumber(this)" row_id="${data.row_id}"><a>${data.amount_display}</a></td>
    `;
    } else {
      content = `<td><a onClick="compareCore.shiftRow(event, this, ${data.row_id})"><i class="fa-solid fa-arrow-right"></i></a></td><td>${data.amount_display}</td>`;
    }
    // TODO: Use trim and join with '\b'?
    return [start, content, end, collapsedRowHtml].filter(Boolean).join('');
  },

  build_table: function (table_id, data, is_target) {
    data.sort(commonHelpers.numberSorter);
    let rows = '';
    for (const [index, obj] of data.entries()) {
      obj['row_id'] = `${index}`;
      rows += compareCore.build_row(obj, is_target);
    }
    var header = `
      <thead>
        <tr>
          <th>Action</th>
          <th>Amount</th>
          <th>Name</th>
          <th>Location</th>
          <th>Unit</th>
        </tr>
      </thead>
    `;
    const content = `
      <tbody>
        ${rows}
      </tbody>
    `;
    document.getElementById(table_id).innerHTML = header + content;
  },

  createOneToOneProxyFunc: function (event) {
    event.preventDefault();

    var submission_data = {
      exchanges: [{ input_id: compareCore.sharedData.target_id, amount: 1.0 }],
      source: compareCore.sharedData.source_id,
      comment: 'One-to-one proxy',
      name:
        'Proxy for ' +
        compareCore.sharedData.target_name
          .replace('Market group for ', '')
          .replace('market group for ', '')
          .replace('Market for ', '')
          .replace('market for ', '')
          .trim(),
    };
    var url = '/create-proxy/';
    fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission_data),
    }).then((response) => {
      if (response.redirected) {
        window.location.href = response.url;
      }
    });
  },

  createProxyFunc: function (event) {
    event.preventDefault();
    var span = document.getElementById('modal-content-wrapper');
    var name =
      'Proxy for ' +
      compareCore.sharedData.target_name
        .replace('Market group for ', '')
        .replace('market group for ', '')
        .replace('Market for ', '')
        .replace('market for ', '')
        .trim();
    var text = `
      <form>
        <label for="proxy-name">Proxy name</label>
        <input class="u-full-width" type="text" id="proxy-name" name="proxy-name" value="${name}">
        <label for="proxy-comment">Comment</label>
        <textarea class="u-full-width" id="proxy-comment" name="proxy-comment">${compareCore.comment}</textarea>
        <p><button class="button-primary" id="create-proxy-submit-button">Create Proxy Process</button> | Unit: ${compareCore.sharedData.source_node_unit} | Location: ${compareCore.sharedData.source_node_location}</p>
        <table>
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Comment</th>
          </tr>
    `;

    compareCore.sharedData.target_data.forEach(function (item, _index) {
      text += `
          <tr input_id=${item.input_id}>
            <td>${item.name}</td>
            <td>${item.amount_display}</td>
            <td><textarea type="text" id="proxy-name-${item.input_id}" name="proxy-name-${item.input_id}"></textarea></td>
          </tr>
      `;
    });

    text += `
        </table>
      </form>
    `;
    span.innerHTML = text;
    compareCore.modal.style.display = 'block';

    var submit = document.getElementById('create-proxy-submit-button');
    submit.addEventListener('click', async (e) => {
      e.preventDefault();
      var submission_data = {
        exchanges: compareCore.sharedData.target_data,
        source: compareCore.sharedData.source_id,
        comment: document.getElementById('proxy-comment').value,
        name: document.getElementById('proxy-name').value,
      };
      var url = '/create-proxy/';
      fetch(url, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission_data),
      }).then((response) => {
        if (response.redirected) {
          window.location.href = response.url;
        }
      });
    });
  },

  replaceWithTarget: function (elem) {
    compareRowClick.disableRowClick();
    compareCore.sharedData.target_data.push(compareCore.sharedData.target_node);
    compareCore.sharedData.target_data.splice(0, compareCore.sharedData.target_data.length - 1);
    compareCore.comment += `* Collapsed input exchanges to target node\n`;
    compareCore.build_table('target-table', compareCore.sharedData.target_data, true);
    elem.innerHTML = '';
  },

  removeRow: function (element) {
    compareRowClick.disableRowClick();
    var row_id = element.parentElement.getAttribute('row_id');

    function removeValue(obj, index, arr) {
      if (obj.row_id == row_id) {
        compareCore.comment += `* Removed exchange of ${obj.amount} ${obj.unit} ${obj.name} from ${obj.location}.\n`;
        arr.splice(index, 1);
        return true;
      }
      return false;
    }
    compareCore.sharedData.target_data.filter(removeValue);
    compareCore.build_table('target-table', compareCore.sharedData.target_data, true);
  },

  expandRow: function (element) {
    compareRowClick.disableRowClick();
    var url =
      '/expand/' + element.getAttribute('input_id') + '/' + element.getAttribute('amount') + '/';
    var t = compareCore.sharedData.target_data.find(
      (item) => item.input_id == element.getAttribute('input_id'),
    );
    compareCore.comment += `* Expanded process inputs of ${t.amount} ${t.unit} from ${t.name} in ${t.location}.\n`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        data.forEach(function (item, _index) {
          compareCore.sharedData.target_data.push(item);
        });
        compareCore.sharedData.target_data.sort(commonHelpers.numberSorter);
        compareCore.removeRow(element);
      });
  },

  replaceAmountRow: function (elem, target_id) {
    compareRowClick.disableRowClick();
    var s = compareCore.sharedData.source_data.find(
      (item) => item.row_id == elem.getAttribute('source_id'),
    );
    var t = compareCore.sharedData.target_data.find((item) => item.row_id == target_id);
    compareCore.comment += `* Used source database amount ${s.amount} ${s.unit} from ${s.name} in ${s.location} instead of ${t.amount} ${t.unit} from ${t.name} in ${t.location}.\n`;
    document.getElementById('number-current-amount').innerText = elem.getAttribute('amount');
  },

  rescaleAmount: function (target_id) {
    compareRowClick.disableRowClick();
    var t = compareCore.sharedData.target_data.find((item) => item.row_id == target_id);
    const scale = Number(document.getElementById('rescale_number').value);
    const node = document.getElementById('number-current-amount');
    if (scale != 1) {
      compareCore.comment += `* Rescaled amount ${t.amount} ${t.unit} from ${t.name} in ${t.location} by ${scale}.\n`;
    }
    node.innerText = Number(node.innerText) * scale;
  },

  setNewNumber: function (target_id) {
    compareRowClick.disableRowClick();
    var t = compareCore.sharedData.target_data.find((item) => item.row_id == target_id);
    const new_value = document.getElementById('new_number').value;
    compareCore.comment += `* Set manual exchange value of ${new_value} instead of ${t.amount} ${t.unit} for ${t.name} in ${t.location}.\n`;
    document.getElementById('number-current-amount').innerText = new_value;
  },

  setNumber: function (elem) {
    compareRowClick.disableRowClick();
    const row_id = elem.getAttribute('row_id');
    const current = Number(document.getElementById('number-current-amount').innerText);
    compareCore.sharedData.target_data.forEach(function (item, _index) {
      if (item.row_id == row_id) {
        item.amount = current;
        item.amount_display = current.toExponential();
      }
    });
    compareCore.modal.style.display = 'none';
    compareCore.build_table('target-table', compareCore.sharedData.target_data, true);
  },

  editNumber: function (td) {
    compareRowClick.disableRowClick();
    var row = compareCore.sharedData.target_data.find(
      (item) => item.row_id == td.getAttribute('row_id'),
    );
    var span = document.getElementById('modal-content-wrapper');

    var start = `
      <h3>${row.name} | ${row.location} | ${row.unit}</h3>
      <div class="five columns">
        <p>Click on a row to take that value</p>
        <table>
          <tr>
            <th>Amount</th>
            <th>Name</th>
            <th>Unit</th>
          </tr>
    `;
    compareCore.sharedData.source_data.forEach(function (item, _index) {
      start += `
        <tr amount="${item.amount}" source_id="${item.row_id}" onClick="compareCore.replaceAmountRow(this, ${row.row_id})">
          <td>${item.amount_display}</td>
          <td>${item.name}</td>
          <td>${item.unit}</td>
        </tr>
      `;
    });

    const end = `
        </table>
      </div>
      <div class="five columns">
        <h4>Original amount: ${row.amount}</h4>
        <h4>Current amount: <span id="number-current-amount">${row.amount}</span></h4>
        <button class="button-primary" id="close-number-editor" row_id="${row.row_id}" onClick="compareCore.setNumber(this)">Set and close</button>
        <form>
          <div>
            <label>Enter new amount</label>
            <input type="number" id="new_number" value="${row.amount}">
            <button onClick="compareCore.setNewNumber(${row.row_id})" id="new-number-button">Set</button>
          </div>
          <hr />
          <div>
            <label>Rescale current amount</label>
            <input type="number" id="rescale_number" value="1.0">
            <button onClick="compareCore.rescaleAmount(${row.row_id})" id="rescale-button">Rescale</button>
          </div>
        </form>
      </div>
    `;

    span.innerHTML = start + end;
    document.getElementById('rescale-button').addEventListener('click', compareCore.stop, false);
    document.getElementById('new-number-button').addEventListener('click', compareCore.stop, false);
    document
      .getElementById('close-number-editor')
      .addEventListener('click', compareCore.stop, false);
    compareCore.modal.style.display = 'block';
  },

  stop: function (event) {
    event.preventDefault();
  },

  hideModal: function () {
    compareCore.modal.style.display = 'none';
  },

  /** initCompare -- Initialize compare feature (entry point)
   * @param {object} sharedData -- See initialization in `bw_matchbox/assets/templates/compare.html`
   */
  initCompare: function (sharedData) {
    // Save public data...
    this.sharedData = sharedData;
    compareRowsHelpers.sharedData = sharedData;

    // Create tables...
    compareCore.build_table('source-table', compareCore.sharedData.source_data, false);
    compareCore.build_table('target-table', compareCore.sharedData.target_data, true);

    // Button handlers...
    document
      .getElementById('save-mapping-button')
      .addEventListener('click', compareCore.createProxyFunc, false);
    document
      .getElementById('one-to-one')
      .addEventListener('click', compareCore.createOneToOneProxyFunc, false);

    // Get modal node...
    compareCore.modal = document.getElementById('number-editor');

    // Link close modal button handler (TODO: To use more specific class name?)...
    const closer = document.getElementsByClassName('close')[0];
    if (closer) {
      closer.onclick = compareCore.hideModal;
    }
  },
};
