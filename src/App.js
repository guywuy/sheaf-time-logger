import React, { Component } from "react";
import * as utils from "./utils";
import {Day} from "./Day";

class App extends Component {
  constructor() {
    super();

    this.state = {
      currentWeek: 0,
      weeklyRequiredTotalMinutes: 60 * 22.5,
      weeklyTotalProgress: 60 * 12.5,
      weeks: [],
      time: ""
    };

    this.handleTimeChange = this.handleTimeChange.bind(this);
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

  updateWeeklyProgress(){

    let totalForTheWeek = 0;
    
    if(!this.state.time) return;
    
    for (let day in this.state.time) {
      let dayTotal = (this.state.time[day].total && this.state.time[day].total > 0) ? this.state.time[day].total : 0;
      totalForTheWeek += dayTotal
    }

    this.setState({
      weeklyTotalProgress : totalForTheWeek
    })

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
      
    this.setState({
      time : {
        ...this.state.time,
        [whichDay]: {
          ...this.state.time[whichDay],
          [whichPeriod] : newValue,
          'total' : totalTime
        },
      }
    }, this.updateWeeklyProgress())
      

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

  componentDidUpdate(prevProps, prevState) {
    
  }

  render() {
    return (
      <div className="app">
        <header className="header">
          <h1 className="header__title">Timelogger</h1>
        </header>
        
        
        <section className="timelog">
          <Day 
          whichDay='weds'
          timeValue={this.state.time.weds}
          onChange={this.handleTimeChange}
          >
          </Day>

          <Day 
          whichDay='thurs'
          timeValue={this.state.time.thurs}
          onChange={this.handleTimeChange}
          >
          </Day>

          <Day 
          whichDay='fri'
          timeValue={this.state.time.fri}
          onChange={this.handleTimeChange}
          >
          </Day>

          
        </section>


        <section className="progress">
          <div>
          <h1>TOTAL FOR THE WEEK: {utils.formatMinutesAsString(this.state.weeklyTotalProgress)} / {utils.formatMinutesAsString(this.state.weeklyRequiredTotalMinutes)}</h1>
            <label htmlFor="weekly-progress">Weekly progress</label>
            <progress
              id="weekly-progress"
              name="weekly-progress"
              max={this.state.weeklyRequiredTotalMinutes}
              value={this.state.weeklyTotalProgress}
            >
              {this.state.weeklyTotalProgress}
            </progress>
          </div>
        </section>
      </div>
    );
  }
}

export default App;
