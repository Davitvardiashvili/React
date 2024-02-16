import React from 'react';

const ChampionshipCup = ({ rank }) => {
  const getAnimationClass = () => {
    switch (rank) {
      case 1:
        return 'gold';
      case 2:
        return 'silver';
      case 3:
        return 'bronze';
      default:
        return '';
    }
  };

  return (
    <div className={`championship-cup ${getAnimationClass()}`}></div>
  );
};

export default ChampionshipCup;
