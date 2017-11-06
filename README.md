# calendar-view

Datepicker inspired by [Windows Calendar view]

Supports Preact & React (not tested)

[Windows Calendar view]: https://docs.microsoft.com/en-us/windows/uwp/controls-and-patterns/calendar-view

[Demo](https://laggingreflex.github.io/calendar-view/demo)

<video autoplay loop src="https://giant.gfycat.com/AncientWindyLice.mp4">
  <a href="https://gfycat.com/AncientWindyLice">
    <img src="https://thumbs.gfycat.com/AncientWindyLice-max-14mb.gif" alt="gif">
  </a>
</video>

## Install

```
npm i calendar-view
```

## Usage

```js
import DatePicker from 'calendar-view/react'

<DatePicker
  date={/* initial date (optional, default: new Date) */}
  onSelect={(date, yyyymmdd) => {
    // triggered when user selects a date in the Month view
    // date = JS Date object
    // yyyymmdd = format useful for <input type='date'>
  }}
>
```

