import React from 'react';
import * as utils from "./utils";

export const Day = ({
  whichDay,
  timeValue,
  onChange,
  disabled
}) => {

  const breakTimeOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
  return (
    <div className="day">
      <div className="day__dayname">
        <h2>{ whichDay.toUpperCase() }</h2>
      </div>

      {!disabled && 
      <div>
        <label htmlFor={`time-${ whichDay }-start`}>Start</label>
        <input
          type="time"
          id={`time-${ whichDay }-start`}
          data-day={ whichDay }
          data-period="start"
          value={(timeValue && timeValue.start) ? timeValue.start : ''}
          onChange={onChange}
          />
      </div>
      }
      {disabled &&
      <div>
        <h5>{(timeValue && timeValue.start) ? timeValue.start : '--'}</h5>
      </div>
      }

      {!disabled &&
      <div>
        <label htmlFor={`time-${ whichDay }-break`}>Break</label>
        <select
          id={`time-${ whichDay }-break`}
          data-day={ whichDay }
          data-period="break"
          value={(timeValue && timeValue.break) ? timeValue.break : 0}
          onChange={onChange}
        >
          { breakTimeOptions.map((option, i) => {
            return (
              <option value={option} key={i}>{option}</option>
              )
          }) }
        </select>
      </div>
      }
      {disabled &&
      <div>
        <h5>{(timeValue && timeValue.break) ? timeValue.break : '--'}</h5>
      </div>
      }

      {!disabled &&
      <div>
        <label htmlFor={`time-${ whichDay }-end`}>End</label>
        <input
          type="time"
          id={`time-${ whichDay }-end`}
          data-day={ whichDay }
          data-period="end"
          value={(timeValue && timeValue.end) ? timeValue.end : ''}
          onChange={onChange}
          />
      </div>
      }
      {disabled &&
      <div>
        <h5>{(timeValue && timeValue.end) ? timeValue.end : '--'}</h5>
      </div>
      }

      <h3 className="day__total">{ (timeValue && timeValue.total) ? utils.formatMinutesAsString(timeValue.total) : 0 }</h3>
    </div>
  )
}