// @ts-check

/**
 * @class AllocatePageNodes
 */
export class AllocatePageNodes {
  /** @type {HTMLElement} */
  rootNode;

  /** @constructor
   * @param {object} [params]
   * @param {HTMLElement} [params.rootNode]
   */
  constructor(params = {}) {
    if (params.rootNode) {
      this.rootNode = params.rootNode;
    }
  }

  /**
   * @param {HTMLElement} rootNode
   */
  setRootNode(rootNode) {
    this.rootNode = rootNode;
  }

  getRootNode() {
    if (!this.rootNode) {
      this.rootNode = document.getElementById('allocate-layout');
    }
    return this.rootNode;
  }

  /** @return {HTMLElement} */
  getGroupsToolbarNode() {
    const columnsLayout = this.getRootNode();
    return columnsLayout.querySelector('#allocate-groups-toolbar');
  }

  /** @return {HTMLElement} */
  getGroupsListNode() {
    const columnsLayout = this.getRootNode();
    return columnsLayout.querySelector('#allocate-groups-list');
  }

  /** @return {HTMLElement} */
  getSourcesColumnNode() {
    const columnsLayout = this.getRootNode();
    return columnsLayout.querySelector('#allocate-sources-column');
  }

  /**
   * @param {TAllocationType} type
   * @return {HTMLElement}
   */
  getInputsListNode(type) {
    const sourcesColumnNode = this.getSourcesColumnNode();
    return sourcesColumnNode.querySelector('#' + type + '-inputs');
  }

  /**
   * @param {TLocalGroupId} groupId
   * @return {HTMLElement}
   */
  getGroupNode(groupId) {
    const groupsListNode = this.getGroupsListNode();
    return groupsListNode.querySelector('.group[group-id="' + groupId + '"]');
  }

  /** Restore grouped item in one of input tables.
   * @param {TAllocationData} item
   * @return {HTMLElement}
   */
  getInputNode(item) {
    const {
      id, // TAllocationId;
      type, // TAllocationType; // 'technosphere'
      // amount, // number; // 0.06008158208572887
      // input, // TAllocationRecord; // {name: 'Clay-Williams', unit: 'kilogram', location: 'GLO', product: 'LLC', categories: 'Unknown'}
      // output, // TAllocationRecord; // {name: 'Smith LLC', unit: 'kilogram', location: 'GLO', product: 'Inc', categories: 'Unknown'}
      // inGroup, // TLocalGroupId; // Local data: input data is in group (should not be displayed in source data, but in group)
    } = item;
    const inputsListNode = this.getInputsListNode(type);
    return inputsListNode.querySelector('.input-row[data-id="' + id + '"]');
  }

  getColumnsLayoutNode() {
    const columnsLayout = this.getRootNode();
    return columnsLayout.querySelector('#allocate-columns-layout');
  }

  getStatisticsNode() {
    const rootNode = this.getRootNode();
    return rootNode.querySelector('#statistics-info');
  }

  getErrorNode() {
    const rootNode = this.getRootNode();
    return rootNode.querySelector('.info-tableau .error');
  }
}
