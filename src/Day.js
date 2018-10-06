import React from 'react';
import * as utils from "./utils";

export const Day = ({
  whichDay,
  timeValue,
  onChange
}) => {
  return (
    <div className="day">
      <div className="day__dayname">
        <h2>{ whichDay.toUpperCase() }</h2>
      </div>

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

      <div>
        <label htmlFor={`time-${ whichDay }-break`}>Break</label>
        <input
          type="time"
          id={`time-${ whichDay }-break`}
          data-day={ whichDay }
          data-period="break"
          value={(timeValue && timeValue.break) ? timeValue.break : ''}
          onChange={onChange}
          />
      </div>

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

      <h3 className="day__total">{ (timeValue && timeValue.total) ? utils.formatMinutesAsString(timeValue.total) : 0 }</h3>
    </div>
  )
}