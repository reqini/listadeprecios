// Paginator.js
import React from 'react';

const Paginator = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div>
      <span>Página actual: {currentPage}</span>
      <ul>
        {pages.map(page => (
          <li key={page}>
            <button onClick={() => onPageChange(page)}>{page}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Paginator;