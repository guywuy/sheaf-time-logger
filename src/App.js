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
      weeklyRequiredTotalMinutes: 60 * 22.5,
      weeklyTotalProgress: 0,
      weeks: {},
      time: {}
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
    this.setState({
      currentWeek: this.state.currentWeek + 1,
      displayWeek: this.state.currentWeek + 1,
      weeks: {
        ...this.state.weeks,
        [this.state.currentWeek]: {
          ...this.state.time,
          dateSaved: new Date().toLocaleDateString(),
          weeklyTotalProgress: this.state.weeklyTotalProgress
        }
      },
      time: {},
      weeklyTotalProgress : 0
    }, this.updateWeeklyProgress())
  }

  updateWeeklyProgress(){

    let totalForTheWeek = 0;
    
    if (!this.state.time) {
      return this.setState({
        weeklyTotalProgress : 0
      });
    }
    
    for (let day in this.state.time) {
      let dayTotal = (this.state.time[day].total && (this.state.time[day].total > 0)) ? this.state.time[day].total : 0;
      totalForTheWeek += dayTotal
    }

    this.setState({
      weeklyTotalProgress : totalForTheWeek
    });
  }

  handleTimeChange(ev) {
    let changedElement = ev.target;
    let whichDay = changedElement.dataset.day;
    let whichPeriod = changedElement.dataset.period;
    let newValue = changedElement.value;
    
    let totalTime = 0;
    let breakTime = (this.state.time[whichDay] && this.state.time[whichDay].break) ? this.state.time[whichDay].break : "00:00";

    // UPDATE TOTAL TIME FOR THE DAY
    switch (whichPeriod) {
      case 'start' :
        if (this.state.time[whichDay] &&
          this.state.time[whichDay].start &&
          this.state.time[whichDay].end &&
          newValue < this.state.time[whichDay].end
        ){
          totalTime = utils.getDifferenceBetweenTimesInMinutes(newValue, this.state.time[whichDay].end, breakTime)
        }
        break;
      case 'end' :
        if (this.state.time[whichDay] &&
          this.state.time[whichDay].start &&
          this.state.time[whichDay].end &&
          this.state.time[whichDay].start < newValue
        ){
          totalTime = utils.getDifferenceBetweenTimesInMinutes(this.state.time[whichDay].start, newValue, breakTime)
        }
        break;
      case 'break' :
        if (this.state.time[whichDay] &&
          this.state.time[whichDay].start &&
          this.state.time[whichDay].end &&
          this.state.time[whichDay].start < this.state.time[whichDay].end
        ){
          totalTime = utils.getDifferenceBetweenTimesInMinutes(this.state.time[whichDay].start, this.state.time[whichDay].end, newValue)
        }
        break;
      default:
        break;
    }

    let totalForTheWeek = 0;
    
    for (let day in this.state.time) {
      // If day is the updated day, use the new totalTime, else add the day.total from state
      if (day === whichDay) {
        totalForTheWeek += totalTime
      } else {
        let dayTotal = (this.state.time[day].total && (this.state.time[day].total > 0)) ? this.state.time[day].total : 0;
        totalForTheWeek += dayTotal
      }
    }
      
    this.setState({
      weeklyTotalProgress : totalForTheWeek,
      time : {
        ...this.state.time,
        [whichDay]: {
          ...this.state.time[whichDay],
          [whichPeriod] : newValue,
          'total' : totalTime
        },
      }
    })
  }
  
  resetWeek(){
    this.setState({
      time : {},
      weeklyTotalProgress : 0
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
      weeklyRequiredTotalMinutes: 60 * 22.5,
      weeklyTotalProgress: 0,
      weeks: {},
      time: {}
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
    const timeObject = isCurrentWeek ? this.state.time : this.state.weeks[this.state.displayWeek];

    return (
      <div className="app">
        <header className="header">
          { hasPreviousWeek &&
            <button id="button--view-previous" onClick={ this.viewPreviousWeek }>&lt;</button>
          }
          <div className="header__title">
            <h1>Week { this.state.displayWeek }</h1>
            { !isCurrentWeek && 
              <small>Current week: { this.state.currentWeek }</small>
            }
          </div>
          
          { !isCurrentWeek &&
            <button id="button--view-current" onClick={ this.viewCurrentWeek }>Back to current week</button>
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
          timeValue={this.state.time.weds}
          onChange={this.handleTimeChange}
          disabled={false}
          />
          
          <Day
          whichDay='thurs'
          timeValue={this.state.time.thurs}
          onChange={this.handleTimeChange}
          disabled={false}
          />
          
          <Day
          whichDay='fri'
          timeValue={this.state.time.fri}
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
          timeValue={this.state.time.weds}
          onChange={this.handleTimeChange}
          disabled={true}
          />
          
          <Day
          whichDay='thurs'
          timeValue={this.state.time.thurs}
          onChange={this.handleTimeChange}
          disabled={true}
          />
          
          <Day
          whichDay='fri'
          timeValue={this.state.time.fri}
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

                {this.state.weeklyTotalProgress === 0 ? '0' : utils.formatMinutesAsString(this.state.weeklyTotalProgress)}</span> / {utils.formatMinutesAsString(this.state.weeklyRequiredTotalMinutes)}
              </strong>
            </p>
            <label htmlFor="weekly-progress" className="progress__label">Weekly progress</label>
            
            <progress
              className={ this.state.weeklyTotalProgress >= this.state.weeklyRequiredTotalMinutes ? "progress__bar progress__bar--complete" : "progress__bar" }
              name="weekly-progress"
              max={this.state.weeklyRequiredTotalMinutes}
              value={this.state.weeklyTotalProgress}
              >
              {this.state.weeklyTotalProgress}
            </progress>
            <p className="progress__bar-label">{ Math.round(this.state.weeklyTotalProgress * 100 / this.state.weeklyRequiredTotalMinutes) }%</p>

            <button id="button--new-week" onClick={ this.startNewWeek }>Start new week</button>
            <button id="button--reset" onClick={ this.resetWeek }>Reset week</button>
            
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
        { !this.state.showDeleteConfirmation && 
          <button id="button--delete-all" 
          onClick={this.showClearConfirmation}>Clear ALL data</button>
        }
        { this.state.showDeleteConfirmation && 
        <div>
          <button id="button--delete-all-cancel" 
          onClick={this.cancelClearAllData}>NO!</button>
          <button id="button--delete-all-confirm" 
          onClick={this.confirmClearAllData}>REALLY?!?!</button>
        </div>
        }
      </div>
    );
  }
}

export default App;
