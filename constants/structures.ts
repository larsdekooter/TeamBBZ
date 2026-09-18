export class Time {
  private time: number;
  constructor(time: number | string) {
    if (typeof time === "number") {
      this.time = time;
    } else {
      if (time.length > 5) {
        const [minutes, seconds] = time.split(":");
        this.time = parseInt(minutes) * 60 + parseFloat(seconds);
      } else {
        this.time = parseFloat(time);
      }
    }
  }

  convertToString() {
    const minutes = Math.floor(this.time / 60);
    const seconds = (this.time - minutes * 60).toFixed(2);
    return `${minutes}:${seconds.length === 5 ? seconds : `0${seconds}`}`;
  }

  convertToNumber() {
    return this.time;
  }
}
