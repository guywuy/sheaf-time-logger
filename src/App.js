import React, { Component } from "react";
import * as utils from "./utils";
import {Day} from "./Day";

class App extends Component {
  constructor() {
    super();

    this.state = {
      currentWeek: 0,
      displayWeek: 0,
      showClearConfirmation: false,
      weeklyRequiredTotalMinutes: 60 * 22.2,
      weeks: {
        0: {
          weds: {},
          thurs: {},
          fri: {},
        }
      },
    };

    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.resetWeek = this.resetWeek.bind(this);
    this.startNewWeek = this.startNewWeek.bind(this);
    this.viewCurrentWeek = this.viewCurrentWeek.bind(this);
    this.viewPreviousWeek = this.viewPreviousWeek.bind(this);
    this.showClearConfirmation = this.showClearConfirmation.bind(this);
    this.cancelClearAllData = this.cancelClearAllData.bind(this);
    this.confirmClearAllData = this.confirmClearAllData.bind(this);
  }

  saveStateToLocalStorage() {
    // for every item in React state
    for (let key in this.state) {
      // save to localStorage
      localStorage.setItem(key, JSON.stringify(this.state[key]));
    }
  }

  hydrateStateWithLocalStorage() {
    // for all items in state
    for (let key in this.state) {
      // if the key exists in localStorage
      if (localStorage.hasOwnProperty(key)) {
        // get the key's value from localStorage
        let value = localStorage.getItem(key);

        // parse the localStorage string and setState
        try {
          value = JSON.parse(value);
          this.setState({ [key]: value });
        } catch (e) {
          // handle empty string
          this.setState({ [key]: value });
        }
      }
    }
  }

  startNewWeek(){
    let nextWeekKey = this.state.currentWeek + 1
    this.setState({
      currentWeek: nextWeekKey,
      displayWeek: nextWeekKey,
      weeks: {
        ...this.state.weeks,
        [this.state.currentWeek]: {
          ...this.state.weeks[this.state.currentWeek],
          dateSaved: new Date().toLocaleDateString()
        },
        [nextWeekKey]: {
          weds: {},
          thurs: {},
          fri: {},
        }
      },
    }, this.updateWeeklyProgress())
  }

  updateWeeklyProgress(){

    let totalForTheWeek = 0;
    
    if (!this.state.weeks[this.state.currentWeek]) {
      return;
    }
    
    for (let day in this.state.weeks[this.state.currentWeek]) {
      let dayTotal = (this.state.weeks[this.state.currentWeek][day].total && (this.state.weeks[this.state.currentWeek][day].total > 0)) ? this.state.weeks[this.state.currentWeek][day].total : 0;
      totalForTheWeek += dayTotal
    }

    this.setState({
      weeks: {
        ...this.state.weeks,
        [this.state.currentWeek]: {
          ...this.state.weeks[this.state.currentWeek],
          weeklyTotalProgress : totalForTheWeek
        }
      },
    });
  }

  handleTimeChange(ev) {
    let currentWeekData = this.state.weeks[this.state.currentWeek];
    let changedElement = ev.target;
    let whichDay = changedElement.dataset.day;
    let whichPeriod = changedElement.dataset.period;
    let newValue = changedElement.value;
    
    let totalTime = 0;
    let breakTime = (currentWeekData[whichDay] && currentWeekData[whichDay].break) ? currentWeekData[whichDay].break : "00:00";

    // UPDATE TOTAL TIME FOR THE DAY
    switch (whichPeriod) {
      case 'start' :
        if (currentWeekData[whichDay] &&
          currentWeekData[whichDay].start &&
          currentWeekData[whichDay].end &&
          newValue < currentWeekData[whichDay].end
        ){
          totalTime = utils.getDifferenceBetweenTimesInMinutes(newValue, currentWeekData[whichDay].end, breakTime)
        }
        break;
      case 'end' :
        if (currentWeekData[whichDay] &&
          currentWeekData[whichDay].start &&
          currentWeekData[whichDay].end &&
          currentWeekData[whichDay].start < newValue
        ){
          totalTime = utils.getDifferenceBetweenTimesInMinutes(currentWeekData[whichDay].start, newValue, breakTime)
        }
        break;
      case 'break' :
        if (currentWeekData[whichDay] &&
          currentWeekData[whichDay].start &&
          currentWeekData[whichDay].end &&
          currentWeekData[whichDay].start < currentWeekData[whichDay].end
        ){
          totalTime = utils.getDifferenceBetweenTimesInMinutes(currentWeekData[whichDay].start, currentWeekData[whichDay].end, newValue)
        }
        break;
      default:
        break;
    }

    let totalForTheWeek = 0;
    
    for (let day in currentWeekData) {
      // If day is the updated day, use the new totalTime, else add the day.total from state
      if (day === whichDay) {
        totalForTheWeek += totalTime
      } else {
        let dayTotal = (currentWeekData[day].total && (currentWeekData[day].total > 0)) ? currentWeekData[day].total : 0;
        totalForTheWeek += dayTotal
      }
    }
      
    this.setState({
      weeks : {
        ...this.state.weeks,
        [this.state.currentWeek] : { 
          ...currentWeekData,
          weeklyTotalProgress: totalForTheWeek,
          [whichDay]: {
            ...currentWeekData[whichDay],
            [whichPeriod] : newValue,
            total : totalTime
          },
        }
      }
    })
  }
  
  resetWeek(){
    this.setState({
      weeks : {
        ...this.state.weeks,
        [this.state.currentWeek] : {}
      }
    }, this.updateWeeklyProgress())
  }

  showClearConfirmation(){
    this.setState({
      showDeleteConfirmation: true
    })
  }

  cancelClearAllData(){
    this.setState({
      showDeleteConfirmation: false
    })
  }

  confirmClearAllData(){
    this.setState({
      currentWeek: 0,
      displayWeek: 0,
      showDeleteConfirmation: false,
      weeklyRequiredTotalMinutes: 60 * 22.2,
      weeks: {},
    })
  }

  viewCurrentWeek(){
    this.setState({
      displayWeek: this.state.currentWeek
    })
  }

  viewPreviousWeek(){
    this.setState({
      displayWeek: this.state.displayWeek > 0 ? this.state.displayWeek - 1 : this.state.displayWeek
    })
  }

  componentDidMount() {
    this.hydrateStateWithLocalStorage();

    // add event listener to save state to localStorage
    // when user leaves/refreshes the page
    window.addEventListener(
      "beforeunload",
      this.saveStateToLocalStorage.bind(this)
    );
  }

  componentWillUnmount() {
    window.removeEventListener(
      "beforeunload",
      this.saveStateToLocalStorage.bind(this)
    );

    // saves if component has a chance to unmount
    this.saveStateToLocalStorage();
  }

  render() {

    const hasPreviousWeek = this.state.displayWeek > 0;
    const isCurrentWeek = this.state.currentWeek === this.state.displayWeek;
    const timeObject = isCurrentWeek ? this.state.weeks[this.state.currentWeek] : this.state.weeks[this.state.displayWeek];

    return (
      <div className="app">
        <header className="header">
          { hasPreviousWeek &&
            <button className="btn" id="button--view-previous" onClick={ this.viewPreviousWeek }>&lt;</button>
          }
          <div className="header__title">
            <h1>Week { this.state.displayWeek }</h1>
            { !isCurrentWeek && 
              <small>Current week: { this.state.currentWeek }</small>
            }
          </div>
          
          { !isCurrentWeek &&
            <button className="btn btn--primary" id="button--view-current" onClick={ this.viewCurrentWeek }>Back to current week</button>
          }
        </header>
        
        { isCurrentWeek && 
        <section className="timelog">

          <div className="timelog__leftcol">
            <div>
              <p>{ new Date().toLocaleDateString() }</p>
            </div>
            <h2>Start</h2>
            <h2>Break</h2>
            <h2>End</h2>
            <h2>Total</h2>
          </div>

          <Day
          whichDay='weds'
          timeValue={timeObject.weds}
          onChange={this.handleTimeChange}
          disabled={false}
          />
          
          <Day
          whichDay='thurs'
          timeValue={timeObject.thurs}
          onChange={this.handleTimeChange}
          disabled={false}
          />
          
          <Day
          whichDay='fri'
          timeValue={timeObject.fri}
          onChange={this.handleTimeChange}
          disabled={false}
          />
          
        </section>
        }
        
        { !isCurrentWeek && 
        <section className="timelog timelog--past">

          <div className="timelog__leftcol">
            <div>
              <p>{ timeObject.dateSaved }</p>
            </div>
            <h2>Start</h2>
            <h2>Break</h2>
            <h2>End</h2>
            <h2>Total</h2>
          </div>

          <Day
          whichDay='weds'
          timeValue={timeObject.weds}
          onChange={this.handleTimeChange}
          disabled={true}
          />
          
          <Day
          whichDay='thurs'
          timeValue={timeObject.thurs}
          onChange={this.handleTimeChange}
          disabled={true}
          />
          
          <Day
          whichDay='fri'
          timeValue={timeObject.fri}
          onChange={this.handleTimeChange}
          disabled={true}
          />
          
        </section>
        }

        { isCurrentWeek && 
          <section className="progress">
          <p>
          Weekly progress:  
          <strong className="progress__time">
                <span>

                {(!timeObject.weeklyTotalProgress || timeObject.weeklyTotalProgress === 0) ? '0' : utils.formatMinutesAsString(timeObject.weeklyTotalProgress)}</span> / {utils.formatMinutesAsString(this.state.weeklyRequiredTotalMinutes)}
              </strong>
            </p>
            <label htmlFor="weekly-progress" className="progress__label">Weekly progress</label>
            
            <progress
              className={ timeObject.weeklyTotalProgress >= this.state.weeklyRequiredTotalMinutes ? "progress__bar progress__bar--complete" : "progress__bar" }
              name="weekly-progress"
              max={this.state.weeklyRequiredTotalMinutes}
              value={timeObject.weeklyTotalProgress}
              >
              {timeObject.weeklyTotalProgress}
            </progress>
            <p className="progress__bar-label">{ (timeObject.weeklyTotalProgress && timeObject.weeklyTotalProgress > 0) ? Math.round(timeObject.weeklyTotalProgress * 100 / this.state.weeklyRequiredTotalMinutes) : 0 }%</p>

            <button className="btn btn--primary" id="button--new-week" onClick={ this.startNewWeek }>Save and start new week</button>
            <button className="btn btn--warning" id="button--reset" onClick={ this.resetWeek }>Reset week</button>
            
          </section>
        }

        { !isCurrentWeek && 
          <section className="progress">
            <p>
              Weekly progress:  
              <strong className="progress__time">
                <span>

                {timeObject.weeklyTotalProgress === 0 ? '0' : utils.formatMinutesAsString(timeObject.weeklyTotalProgress)}</span> / {utils.formatMinutesAsString(this.state.weeklyRequiredTotalMinutes)}
              </strong>
            </p>
            <label htmlFor="weekly-progress" className="progress__label">Weekly progress</label>
            
            <progress
              className={ timeObject.weeklyTotalProgress >= this.state.weeklyRequiredTotalMinutes ? "progress__bar progress__bar--complete" : "progress__bar" }
              name="weekly-progress"
              max={this.state.weeklyRequiredTotalMinutes}
              value={timeObject.weeklyTotalProgress}
              >
              {timeObject.weeklyTotalProgress}
            </progress>
            <p className="progress__bar-label">{ Math.round(timeObject.weeklyTotalProgress * 100 / this.state.weeklyRequiredTotalMinutes) }%</p>
          </section>
        }

        <hr/>

        <a
          className="btn btn--primary" id="button--download"
          href={`data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(this.state)
          )}`}
          download={`timesheet-${ new Date().toLocaleDateString() }.json`}
        >
          Download Data
        </a>

        { !this.state.showDeleteConfirmation && 
          <button className="btn btn--warning" id="button--delete-all" 
          onClick={this.showClearConfirmation}>Clear all data (cannot be undone)</button>
        }
        { this.state.showDeleteConfirmation && 
        <div>
          <button className="btn btn--primary" id="button--delete-all-cancel" 
          onClick={this.cancelClearAllData}>Cancel</button>
          <button className="btnbtn--warning" id="button--delete-all-confirm" 
          onClick={this.confirmClearAllData}>Yes, I'm sure</button>
        </div>
        }
      </div>
    );
  }
}

export default App;
