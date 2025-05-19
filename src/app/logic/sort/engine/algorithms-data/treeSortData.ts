import type { SortAlgorithm } from '../algorithmRegistry'

const rawPlaintextPseudoCode = [
  'procedure treeSort(list, direction)',
  '  root = null',
  '  for each element in list',
  '    root = insert(root, element)',
  '  end for',
  '  sortedList = []',
  '  inOrderTraversal(root, sortedList, direction)',
  '  return sortedList',
  'end procedure',
  '',
  'function insert(node, value)',
  '  if node is null then',
  '    return createNode(value)',
  '  end if',
  '  if value < node.data then',
  '    node.left = insert(node.left, value)',
  '  else',
  '    node.right = insert(node.right, value)',
  '  end if',
  '  return node',
  'end function',
  '',
  'procedure inOrderTraversal(node, resultList, direction)',
  '  if node is not null then',
  '    if direction == ASC then',
  '      inOrderTraversal(node.left, resultList, direction)',
  '      add node.data to resultList',
  '      inOrderTraversal(node.right, resultList, direction)',
  '    else',
  '      inOrderTraversal(node.right, resultList, direction)',
  '      add node.data to resultList',
  '      inOrderTraversal(node.left, resultList, direction)',
  '    end if',
  '  end if',
  'end procedure',
]

export const treeSortData: SortAlgorithm = {
  id: 'treeSort',
  name: 'Tree Sort',
  description:
    'Tree Sort is a sorting algorithm that builds a binary search tree (BST) from the elements to be sorted, and then performs an in-order traversal on the tree to get the elements in sorted order. In its simplest form, the performance depends heavily on the structure of the BST, which can be skewed if input data is already sorted or nearly sorted, leading to O(n^2) worst-case time. Using a self-balancing BST (like an AVL tree or Red-Black tree) guarantees O(n log n) performance but increases implementation complexity and space requirements.',
  complexity: {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n^2)' }, // O(n log n) with balanced tree
    space: 'O(n)', // For the tree structure
  },
  origin: { name: 'Known in various forms since 1960s (BSTs)' },
  img: '',
  pseudoCode: rawPlaintextPseudoCode,
  languageExamples: {
    c: [
      '#include <stdio.h>',
      '#include <stdlib.h>',
      '#include <stdbool.h>',
      '',
      'typedef struct Node {',
      '    int data;',
      '    struct Node *left, *right;',
      '} Node;',
      '',
      'Node* createNode(int item) {',
      '    Node* temp = (Node*)malloc(sizeof(Node));',
      '    temp->data = item;',
      '    temp->left = temp->right = NULL;',
      '    return temp;',
      '}',
      '',
      'Node* insert(Node* node, int data) {',
      '    if (node == NULL) return createNode(data);',
      '    if (data < node->data)',
      '        node->left = insert(node->left, data);',
      '    else if (data >= node->data)',
      '        node->right = insert(node->right, data);',
      '    return node;',
      '}',
      '',
      'void inOrderTraversal(Node* root, int arr[], int* index, bool ascending) {',
      '    if (root != NULL) {',
      '        if (ascending) {',
      '            inOrderTraversal(root->left, arr, index, ascending);',
      '            arr[(*index)++] = root->data;',
      '            inOrderTraversal(root->right, arr, index, ascending);',
      '        } else { ',
      '            inOrderTraversal(root->right, arr, index, ascending);',
      '            arr[(*index)++] = root->data;',
      '            inOrderTraversal(root->left, arr, index, ascending);',
      '        }',
      '    }',
      '}',
      '',
      'void freeTree(Node* node) {',
      '    if (node == NULL) return;',
      '    freeTree(node->left);',
      '    freeTree(node->right);',
      '    free(node);',
      '}',
      '',
      'void treeSort(int arr[], int n, bool ascending) {',
      '    if (n <= 1) return;',
      '    Node* root = NULL;',
      '    for (int i = 0; i < n; i++)',
      '        root = insert(root, arr[i]);',
      '',
      '    int index = 0;',
      '    inOrderTraversal(root, arr, &index, ascending);',
      '    freeTree(root);',
      '}',
    ],
    cpp: [
      '#include <vector>',
      '#include <functional>',
      '',
      'template <typename T>',
      'struct Node {',
      '    T data;',
      '    Node *left, *right;',
      '    Node(T val) : data(val), left(nullptr), right(nullptr) {}',
      '};',
      '',
      'template <typename T>',
      'Node<T>* insert(Node<T>* node, T data) {',
      '    if (!node) return new Node<T>(data);',
      '    if (data < node->data)',
      '        node->left = insert(node->left, data);',
      '    else',
      '        node->right = insert(node->right, data);',
      '    return node;',
      '}',
      '',
      'template <typename T>',
      'void inOrderTraversal(Node<T>* root, std::vector<T>& arr, int& index, bool ascending) {',
      '    if (root) {',
      '        if (ascending) {',
      '            inOrderTraversal(root->left, arr, index, ascending);',
      '            arr[index++] = root->data;',
      '            inOrderTraversal(root->right, arr, index, ascending);',
      '        } else { ',
      '            inOrderTraversal(root->right, arr, index, ascending);',
      '            arr[index++] = root->data;',
      '            inOrderTraversal(root->left, arr, index, ascending);',
      '        }',
      '    }',
      '}',
      '',
      'template <typename T>',
      'void freeTree(Node<T>* node) {',
      '    if (!node) return;',
      '    freeTree(node->left);',
      '    freeTree(node->right);',
      '    delete node;',
      '}',
      '',
      'template <typename T>',
      'void treeSort(std::vector<T>& arr, bool ascending) {',
      '    if (arr.empty() || arr.size() <= 1) return;',
      '    Node<T>* root = nullptr;',
      '    for (const T& val : arr)',
      '        root = insert(root, val);',
      '',
      '    int index = 0;',
      '    std::vector<T> sorted_arr(arr.size());',
      '    inOrderTraversal(root, sorted_arr, index, ascending);',
      '    arr = sorted_arr;',
      '    ',
      '    freeTree(root);',
      '}',
    ],
    python: [
      'class Node:',
      '    def __init__(self, key):',
      '        self.left = None',
      '        self.right = None',
      '        self.val = key',
      '',
      'def insert(root, key):',
      '    if root is None:',
      '        return Node(key)',
      '    else:',
      '        if key < root.val:',
      '            root.left = insert(root.left, key)',
      '        else:',
      '            root.right = insert(root.right, key)',
      '    return root',
      '',
      'def inorder_traversal(root, result, ascending=True):',
      '    if root:',
      '        if ascending:',
      '            inorder_traversal(root.left, result, ascending)',
      '            result.append(root.val)',
      '            inorder_traversal(root.right, result, ascending)',
      '        else:',
      '            inorder_traversal(root.right, result, ascending)',
      '            result.append(root.val)',
      '            inorder_traversal(root.left, result, ascending)',
      '',
      'def tree_sort(arr, ascending=True):',
      '    if not arr or len(arr) <= 1:',
      '        return arr',
      '    root = None',
      '    for item in arr:',
      '        root = insert(root, item)',
      '    ',
      '    result = []',
      '    inorder_traversal(root, result, ascending)',
      '    return result',
    ],
  },
  pseudoCodeMapping: {
    // treeSort (main procedure)
    0: { c: [15], cpp: [36], python: [16, 24] }, // procedure treeSort
    1: { c: [17], cpp: [38], python: [16] }, // root = null
    2: { c: [18], cpp: [39], python: [16] }, // for each element in list
    3: { c: [19], cpp: [40], python: [16] }, //   root = insert(root, element)
    4: { c: [18], cpp: [39], python: [16] }, // end for
    5: { c: [21], cpp: [42], python: [16] }, // sortedList = [] (arr.clear() in C++)
    6: { c: [22], cpp: [43], python: [16] }, // inOrderTraversal(root, sortedList, direction)
    7: { c: [23], cpp: [44], python: [16] }, // return sortedList (implicit or after freeTree)
    8: { c: [23], cpp: [44], python: [16] }, // end procedure

    // insert (helper function)
    10: { c: [35], cpp: [10], python: [6] }, // function insert(node, value)
    11: { c: [36], cpp: [11], python: [7] }, // if node is null then
    12: { c: [27, 36], cpp: [11], python: [8] }, //   return createNode(value)
    13: { c: [36], cpp: [11], python: [7] }, // end if (implicit for null check)
    14: { c: [37], cpp: [12], python: [9] }, // if value < node.data then
    15: { c: [38], cpp: [13], python: [10] }, //   node.left = insert(node.left, value)
    16: { c: [39], cpp: [14], python: [11] }, // else
    17: { c: [40], cpp: [15], python: [12] }, //   node.right = insert(node.right, value)
    18: { c: [37, 39], cpp: [12, 14], python: [9, 11] }, // end if (value comparison)
    19: { c: [41], cpp: [16], python: [13] }, // return node
    20: { c: [41], cpp: [16], python: [13] }, // end function

    // inOrderTraversal (helper procedure)
    22: { c: [44], cpp: [19], python: [15] }, // procedure inOrderTraversal(node, resultList, direction)
    23: { c: [45], cpp: [20], python: [17] }, // if node is not null then
    24: { c: [46], cpp: [21], python: [18] }, //   if direction == ASC then
    25: { c: [47], cpp: [22], python: [19] }, //     inOrderTraversal(node.left, resultList, direction)
    26: { c: [48], cpp: [23], python: [20] }, //     add node.data to resultList
    27: { c: [49], cpp: [24], python: [21] }, //     inOrderTraversal(node.right, resultList, direction)
    28: { c: [50], cpp: [25], python: [22] }, //   else // direction == DESC
    29: { c: [51], cpp: [26], python: [23] }, //     inOrderTraversal(node.right, resultList, direction)
    30: { c: [52], cpp: [27], python: [20] }, //     add node.data to resultList (for DESC)
    31: { c: [53], cpp: [28], python: [19] }, //     inOrderTraversal(node.left, resultList, direction) (for DESC)
    32: { c: [46, 50], cpp: [21, 25], python: [18, 22] }, //   end if (direction check)
    33: { c: [45], cpp: [20], python: [17] }, // end if (node is not null)
    34: { c: [55], cpp: [29], python: [15] }, // end procedure
  },
  performancePaths: {
    // Performance depends on tree balance, which is data-dependent.
    // Best/Average: Balanced tree. Worst: Skewed tree.
    // All lines are structurally part of the algorithm.
    best: [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27,
      28, 29, 30, 31, 32, 33, 34,
    ],
    worst: [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27,
      28, 29, 30, 31, 32, 33, 34,
    ],
  },
}
