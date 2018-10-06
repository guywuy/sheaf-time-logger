
// Return a number of minutes from a start and end time in format of 'HH:MM'
export function getDifferenceBetweenTimesInMinutes(start, end, breakTime){
    // console.log('start: ', start);
    // console.log('end: ', end);
    
    let totalHours = parseInt(end.split(':')[0], 10) - parseInt(start.split(':')[0], 10);
    // console.log('totalHours: ', totalHours);
    let totalMinutes = parseInt(end.split(':')[1], 10) - parseInt(start.split(':')[1], 10);
    // console.log('totalMinutes: ', totalMinutes);
    
    let totalTimeInMinutes = (totalHours*60) + totalMinutes;

    if (breakTime){
        totalTimeInMinutes -= parseInt(breakTime, 10); 
    }

    return totalTimeInMinutes;
}

export function formatMinutesAsString(mins){
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;

    return `${hours > 0 ? hours + 'h' : ''}${(minutes > 0 && minutes < 10) ? '0' + minutes + 'm' : ''}${(minutes >= 10) ? minutes + 'm' : ''}`
}