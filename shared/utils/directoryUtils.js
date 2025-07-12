// --- Helper Functions ---
const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
export const findItem = (itemId, directory) => {
    return directory[itemId];
};
export const findPath = (itemId, directory) => {
    const path = [];
    let currentItem = findItem(itemId, directory);
    while (currentItem && currentItem.id !== 'root') {
        path.unshift({ id: currentItem.id, name: currentItem.name });
        currentItem = findItem(currentItem.parentId, directory);
    }
    path.unshift({ id: 'root', name: 'Business Brain' }); // Add root
    return path;
};
// --- Core Operation Functions ---
export const createItem = (directory, type, parentId) => {
    const newId = generateId();
    let newItem;
    switch (type) {
        case 'directory':
            newItem = { id: newId, name: "New Folder", type, parentId, children: [] };
            break;
        case 'spreadsheet':
            newItem = { id: newId, name: "Untitled Spreadsheet.xlsx", type, parentId, isVisible: true, content: [['Header1', 'Header2'], ['Data1', 'Data2']] };
            break;
        case 'document':
            newItem = { id: newId, name: "Untitled Document.docx", type, parentId, isVisible: true, content: 'This is a new document.' };
            break;
    }
    const newDirectory = { ...directory };
    newDirectory[newId] = newItem;
    const parent = { ...newDirectory[parentId] };
    parent.children = [...parent.children, newId];
    newDirectory[parentId] = parent;
    return { newDirectory, newItem };
};
const deleteRecursive = (itemId, directory) => {
    let newDirectory = { ...directory };
    const itemToDelete = newDirectory[itemId];
    if (!itemToDelete)
        return newDirectory;
    if (itemToDelete.type === 'directory') {
        itemToDelete.children.forEach(childId => {
            newDirectory = deleteRecursive(childId, newDirectory);
        });
    }
    delete newDirectory[itemId];
    return newDirectory;
};
export const deleteItems = (directory, itemIds) => {
    let newDirectory = { ...directory };
    for (const itemId of itemIds) {
        const item = newDirectory[itemId];
        if (!item)
            continue;
        // Remove from parent's children list
        if (newDirectory[item.parentId]) {
            const parent = { ...newDirectory[item.parentId] };
            parent.children = parent.children.filter(id => id !== itemId);
            newDirectory[item.parentId] = parent;
        }
        // Delete the item and its descendants
        newDirectory = deleteRecursive(itemId, newDirectory);
    }
    return newDirectory;
};
const copyRecursive = (itemId, directory, newParentId) => {
    const originalItem = directory[itemId];
    const newId = generateId();
    let newDirectory = { ...directory };
    let newItem = { ...originalItem, id: newId, parentId: newParentId };
    if (newItem.type === 'directory') {
        newItem.children = [];
        for (const childId of originalItem.children) {
            const result = copyRecursive(childId, newDirectory, newId);
            newDirectory = result.newDirectory;
            newItem.children.push(result.newId);
        }
    }
    newDirectory[newId] = newItem;
    return { newDirectory, newId };
};
export const pasteItems = (directory, clipboard, targetDirectoryId) => {
    let newDirectory = { ...directory };
    const targetParent = { ...newDirectory[targetDirectoryId] };
    if (clipboard.mode === 'copy') {
        targetParent.children = [...targetParent.children]; // Ensure new array
        for (const itemId of clipboard.itemIds) {
            const result = copyRecursive(itemId, newDirectory, targetDirectoryId);
            newDirectory = result.newDirectory;
            targetParent.children.push(result.newId);
        }
    }
    else { // Cut mode
        const itemsToMove = clipboard.itemIds.filter(id => {
            const item = newDirectory[id];
            // Don't move if it's already in the target or is an ancestor
            return item && item.parentId !== targetDirectoryId;
        });
        // Remove from old parents
        itemsToMove.forEach(id => {
            const item = newDirectory[id];
            const oldParent = { ...newDirectory[item.parentId] };
            oldParent.children = oldParent.children.filter(childId => childId !== id);
            newDirectory[item.parentId] = oldParent;
        });
        // Add to new parent and update parentId
        targetParent.children = [...targetParent.children, ...itemsToMove];
        itemsToMove.forEach(id => {
            newDirectory[id] = { ...newDirectory[id], parentId: targetDirectoryId };
        });
    }
    newDirectory[targetDirectoryId] = targetParent;
    return newDirectory;
};
// --- Download Utility ---
const convertToCSV = (data) => {
    return data.map(row => row.map(cell => {
        const strCell = String(cell);
        // Escape quotes and wrap in quotes if it contains comma, quote, or newline
        if (strCell.includes(',') || strCell.includes('"') || strCell.includes('\n')) {
            return `"${strCell.replace(/"/g, '""')}"`;
        }
        return strCell;
    }).join(',')).join('\n');
};
const triggerDownload = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
export const downloadItems = (itemIds, directory) => {
    itemIds.forEach(id => {
        const item = directory[id];
        if (!item || item.type === 'directory')
            return;
        if (item.type === 'spreadsheet') {
            const csvContent = convertToCSV(item.content);
            const filename = item.name.endsWith('.csv') || item.name.endsWith('.xlsx') ? item.name : `${item.name}.csv`;
            triggerDownload(filename, csvContent, 'text/csv;charset=utf-8;');
        }
        else {
            const filename = item.name.endsWith('.txt') || item.name.endsWith('.docx') ? item.name : `${item.name}.txt`;
            triggerDownload(filename, item.content, 'text/plain;charset=utf-8;');
        }
    });
};
export const toggleVisibility = (directory, itemId) => {
    const item = directory[itemId];
    if (!item || item.type === 'directory')
        return directory;
    const newItem = { ...item, isVisible: !item.isVisible };
    return { ...directory, [itemId]: newItem };
}   