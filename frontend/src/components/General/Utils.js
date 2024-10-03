export const genderSelect = [
      { value: "M", desc: "Male" },
      { value: "F", desc: "Female" }
];

export const positionSelect = [
      { value: 1, desc: "Captain" },
      { value: 2, desc: "Councilor" },
      { value: 3, desc: "Secretary" },
      { value: 4, desc: "Treasurer" },
      { value: 5, desc: "SK Chairperson" },
      { value: 6, desc: "SK Councilor" },
      { value: 7, desc: "Peace Officers" },
];

export const projectStatus = [
      { value: 1, desc: "Inactive" },
      { value: 2, desc: "Active" },
];

export const incidentStatus = [
      { value: 1, desc: "Pending" },
      { value: 2, desc: "Ongoing" },
      { value: 3, desc: "Closed" },
];


export const gradeSelect = [
      { value: 7, desc: "Grade 7" },
      { value: 8, desc: "Grade 8" },
      { value: 9, desc: "Grade 9" },
      { value: 10, desc: "Grade 10" },
      { value: 11, desc: "Grade 11" },
      { value: 12, desc: "Grade 12" },
];

export const juniorSelect = [
      { value: 7, desc: "Grade 7" },
      { value: 8, desc: "Grade 8" },
      { value: 9, desc: "Grade 9" },
      { value: 10, desc: "Grade 10" },
];

export const seniorSelect = [
      { value: 11, desc: "Grade 11" },
      { value: 12, desc: "Grade 12" },
];

export const trackSelect = [
      { value: "ACADEMIC", desc: "ACADEMIC" },
      { value: "TECH-VOCATIONAL", desc: "TECH-VOCATIONAL" },
];

export const modalitySelect = [
      { value: "FACE TO FACE", desc: "FACE TO FACE" },
      { value: "BLENDEND LEARNING", desc: "BLENDEND LEARNING" },
      { value: "MODULAR", desc: "MODULAR" },
];

export const prioritySelect = [
      { value: 0, desc: "low" },
      { value: 1, desc: "normal" },
      { value: 2, desc: "high" },
      { value: 3, desc: "urgent" },
];

export const courseSelect = [
      { group: "ACADEMIC", value: "STEM", desc: "STEM" },
      { group: "ACADEMIC", value: "HUMSS", desc: "HUMSS" },
      { group: "TECH-VOCATIONAL", value: "GARMENTS", desc: "GARMENTS" },
      { group: "TECH-VOCATIONAL", value: "COOKERY", desc: "COOKERY" },
      { group: "TECH-VOCATIONAL", value: "SMAW", desc: "SMAW" },
];

export const postStatus = [
      { value: 1, desc: "Active" },
      { value: 2, desc: "Inactive" },
];

export const colorSelect = [
      { value: "success", desc: "Green" },
      { value: "primary", desc: "Red" },
      { value: "warning", desc: "Yellow" },
      { value: "info", desc: "Blue" },
      { value: "dark", desc: "Dark" },
];

export const docstatusSelect = [
      { value: 0, desc: "Cancelled" },
      { value: 1, desc: "Pending" },
      { value: 2, desc: "Processing" },
      { value: 3, desc: "Delivery" },
      { value: 4, desc: "Received" },
];
    

const currentYear = new Date().getFullYear();
export const years = Array.from({ length: currentYear - 1899 }, (_, index) => currentYear - index);

export const currentDate = new Date().toISOString().split('T')[0];
    
export function isEmpty(obj) {
      if (obj === null || obj === undefined) return true;
    
      if (Array.isArray(obj) || typeof obj === 'string') {
            return obj.length === 0;
      }
    
      if (typeof obj === 'object') {
            return Object.keys(obj).length === 0;
      }
    
      return false;
};
    