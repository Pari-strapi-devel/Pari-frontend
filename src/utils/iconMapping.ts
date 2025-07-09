/**
 * Dynamic icon mapping utility for PARI project
 * Maps titles to appropriate icon types based on keywords
 */

export function getIconTypeFromTitle(title: string, index?: number): string {
  const lowerTitle = title.toLowerCase();
  
  // Dynamic icon mapping based on title keywords
  if (lowerTitle.includes('climate') || lowerTitle.includes('weather') || lowerTitle.includes('environment')) {
    return 'Sun';
  }
  
  if (lowerTitle.includes('library') || lowerTitle.includes('book') || lowerTitle.includes('read')) {
    return 'BookOpen';
  }
  
  if (lowerTitle.includes('farmer') || lowerTitle.includes('protest') || lowerTitle.includes('people') || lowerTitle.includes('community')) {
    return 'Users';
  }
  
  if (lowerTitle.includes('face') || lowerTitle.includes('india') || lowerTitle.includes('smile') || lowerTitle.includes('portrait')) {
    return 'Smile';
  }
  
  if (lowerTitle.includes('lockdown') || lowerTitle.includes('livelihood') || lowerTitle.includes('security') || lowerTitle.includes('lock')) {
    return 'Lock';
  }
  
  if (lowerTitle.includes('art') || lowerTitle.includes('artist') || lowerTitle.includes('artisan') || lowerTitle.includes('craft') || lowerTitle.includes('paint')) {
    return 'Palette';
  }
  
  if (lowerTitle.includes('song') || lowerTitle.includes('music') || lowerTitle.includes('grindmill') || lowerTitle.includes('kutchi') || lowerTitle.includes('audio')) {
    return 'Music';
  }
  
  if (lowerTitle.includes('children') || lowerTitle.includes('adivasi') || lowerTitle.includes('tribal') || lowerTitle.includes('brush')) {
    return 'Paintbrush';
  }
  
  if (lowerTitle.includes('health') || lowerTitle.includes('women') || lowerTitle.includes('medical') || lowerTitle.includes('care')) {
    return 'Lightbulb';
  }
  
  if (lowerTitle.includes('work') || lowerTitle.includes('invisible') || lowerTitle.includes('visible') || lowerTitle.includes('labor')) {
    return 'Eye';
  }
  
  if (lowerTitle.includes('freedom') || lowerTitle.includes('fighter') || lowerTitle.includes('independence') || lowerTitle.includes('history')) {
    return 'Flag';
  }
  
  if (lowerTitle.includes('classroom') || lowerTitle.includes('education') || lowerTitle.includes('school') || lowerTitle.includes('learn')) {
    return 'GraduationCap';
  }
  
  // Default fallback icons based on index position if no keyword matches
  const defaultIcons = ['FileText', 'Image', 'Video', 'Headphones', 'Camera', 'Map', 'Calendar', 'Star'];
  
  if (typeof index === 'number' && index < defaultIcons.length) {
    return defaultIcons[index];
  }
  
  // Final fallback
  return 'FileText';
}
