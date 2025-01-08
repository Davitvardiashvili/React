import React from "react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

/**
 * A pill-style, centered day chooser with round arrow buttons
 *
 * Props:
 * - competitionDays: array of day objects { id, date, ... }
 * - currentDayIndex: integer index of the selected day
 * - setCurrentDayIndex: function to update the selected day index
 */
function CompetitionDayChooser({
  competitionDays,
  currentDayIndex,
  setCurrentDayIndex
}) {
  // Decide how many days to display in the "slider"
  const visibleCount = 2;
  let start = currentDayIndex - Math.floor(visibleCount / 2);
  if (start < 0) start = 0;
  let end = start + visibleCount;
  if (end > competitionDays.length) end = competitionDays.length;

  const displayedDays = competitionDays.slice(start, end);

  // Handlers for arrows
  const handlePrevDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const handleNextDay = () => {
    if (currentDayIndex < competitionDays.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  // Style objects
  const styles = {
    container: {
      margin: 0,
      textAlign: "center",
    },
    dayPills: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    arrowBtn: {
      borderRadius: "50%",
      width: "2.2rem",
      height: "2.2rem",
      backgroundColor: "transparent",
      color: "#fff",
      border: "0.13rem solid #FFF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.1rem",
      cursor: "pointer",
      transition: "background-color 0.2s, transform 0.2s",
    },
    arrowBtnHover: {
      backgroundColor: "#FFA500",
      borderColor: "#FFA500",
      color: "#000",
      transform: "scale(1.05)",
    },
    dayPill: {
      cursor: "pointer",
      borderRadius: "2rem",
      padding: "0.3rem 0.8rem",
      minWidth: "70px",
      textAlign: "center",
      fontSize: "0.95rem",
      backgroundColor: "transparent",
      border: "0.13rem solid #FFF",
      color: "#FFFFFF",
      transition: "background-color 0.2s, transform 0.2s",
    },
    dayPillActive: {
      backgroundColor: "#FFA500",
      border: "0.13rem solid #FFA500",
      transform: "scale(1.05)",
      color: "black"
    },
    dayPillHover: {
      backgroundColor: "#faba46",
    },
  };

  // We'll create small onMouseEnter / onMouseLeave to toggle arrow styles
  const handleArrowEnter = (e) => {
    e.currentTarget.style.backgroundColor = styles.arrowBtnHover.backgroundColor;
    e.currentTarget.style.borderColor = styles.arrowBtnHover.borderColor;
    e.currentTarget.style.color = styles.arrowBtnHover.color;
    e.currentTarget.style.transform = styles.arrowBtnHover.transform;
  };

  const handleArrowLeave = (e) => {
    e.currentTarget.style.backgroundColor = styles.arrowBtn.backgroundColor;
    e.currentTarget.style.borderColor = "#FFF";
    e.currentTarget.style.color = "#FFF";
    e.currentTarget.style.transform = "scale(1)";
  };

  return (
    <div style={styles.container}>
      <div style={styles.dayPills}>
        {/* Left Arrow Button */}
        <Button
          style={styles.arrowBtn}
          onClick={handlePrevDay}
          disabled={currentDayIndex <= 0}
          onMouseEnter={handleArrowEnter}
          onMouseLeave={handleArrowLeave}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </Button>

        {/* The day pills */}
        {displayedDays.map((cd) => {
          // find the day index
          const idx = competitionDays.findIndex((d) => d.id === cd.id);
          const isActive = idx === currentDayIndex;

          return (
            <div
              key={cd.id}
              onClick={() => setCurrentDayIndex(idx)}
              style={{
                ...styles.dayPill,
                ...(isActive ? styles.dayPillActive : {}),
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor =
                    styles.dayPillHover.backgroundColor;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor =
                    styles.dayPill.backgroundColor;
                }
              }}
            >
              {cd.date}
            </div>
          );
        })}

        {/* Right Arrow Button */}
        <Button
          style={styles.arrowBtn}
          onClick={handleNextDay}
          disabled={currentDayIndex >= competitionDays.length - 1}
          onMouseEnter={handleArrowEnter}
          onMouseLeave={handleArrowLeave}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </Button>
      </div>
    </div>
  );
}

export default CompetitionDayChooser;
