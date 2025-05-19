export const generateCustomSupplierId = (objectId) => {
    const numericId = parseInt(objectId.slice(0, 6), 16);
    
    return `SI${numericId}`;
};

export const generateCustomProductId = (objectId) => {
    const numericId = parseInt(objectId.slice(0, 6), 16);
    
    return `PI${numericId}`;
};

export const generateCustomPurchaseOrderId = (objectId) => {
    const numericId = parseInt(objectId.slice(0, 6), 16);
    
    return `PO${numericId}`;
};

export const generateCustomGRNId = (objectId) => {
    const numericId = parseInt(objectId.slice(0, 6), 16);
    
    return `GRN${numericId}`;
};

export const generateCustomBackOrderId = (objectId) => {
    const numericId = parseInt(objectId.slice(0, 6), 16);
    
    return `BO${numericId}`;
};

export const generateCustomRMAId = (objectId) => {
    const numericId = parseInt(objectId.slice(0, 6), 16);
    
    return `RMA${numericId}`;
};
  