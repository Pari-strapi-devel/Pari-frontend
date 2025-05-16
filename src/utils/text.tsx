import { JSX } from 'react';

export const highlightMatch = (text: string, query: string): JSX.Element => {
  if (!query || query.length < 1) return <>{text}</>;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
  return (
    <>
      {parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <span key={index} className="bg-yellow-100 dark:bg-yellow-800 font-medium">{part}</span> 
          : part
      )}
    </>
  );
};