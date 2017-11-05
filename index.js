import * as _ from './utils.js';

export default (lib) => {
  const h = lib.h || lib.createComponent;
  const Component = lib.Component;
  const wrapper = (wrapperClass, children) => h('div', { class: `calendar-view ${wrapperClass}` }, children);
  const header = (children) => h('div', { class: 'header' }, children);
  const footer = (children) => h('div', { class: 'footer' }, children);
  const title = (title) => h('div', { class: 'title' }, [title]);
  const table = (rows) => h('table', {}, rows.map(row => h('tr', {}, row.map(cols => h('td', {}, cols)))));
  const button = (props, children = []) => h('button', Object.assign({ type: 'button' }, props, {
    onclick: e => {
      const ret = props.onclick(e);
      e.stopPropagation();
      return ret;
    }
  }), children);
  return class extends Component {
    componentWillMount() {
      const date = new Date();
      this.setState_({ date, currentDate: date, });
    }

    compareYear(a, b) { return a.getFullYear() === b.getFullYear() }
    compareMonth(a, b) { return this.compareYear(a, b) && a.getMonth() === b.getMonth() }
    compareDate(a, b) { return this.compareMonth(a, b) && a.getDate() === b.getDate() }

    // get date() { return new Date(this.state.date) }

    setState_(state) {
      // // console.log(new Error('setState'));
      // const before = this.state.view;
      // // console.log(`before:`, this.state.view);
      this.setState(state)
      // const after = this.state.view;
      // console.log(new Error(`${before} -> ${after}`));
    }


    todayButton() {
      return (this.state.currentDate !== this.state.date || (this.state.view && this.state.view !== 'month')) && button({
        onclick: () => this.setState_({
          view: 'month',
          date: this.state.currentDate,
        })
      }, ['•'])
    }

    incMonth(inc = 1) {
      // const date = this.date;
      const date = new Date(this.state.date);
      date.setMonth(date.getMonth() + inc);
      this.setState_({ date });
    }

    render() {
      if (this.state.view === 'decade') {
        return this.renderDecade();
      } else if (this.state.view === 'year') {
        return this.renderYear();
      } else {
        return this.renderMonth();
      }
    }
    renderMonth() {
      const month = this.state.date.getMonth();
      const year = this.state.date.getFullYear();
      const days = _.days.map(_ => _.substr(0, 3));
      const firstDateOfMonth = new Date(year, month, 1);
      const firstDayOfMonth = firstDateOfMonth.getDay();
      const daysInMonth = new Date(year, month - 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();

      const calendar = [];
      calendar.push([]);
      for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        // calendar[0].push(daysInPrevMonth - i);
        calendar[0].push(new Date(year, month - 1, daysInPrevMonth - i));
      }
      for (let i = 1; i <= daysInMonth; i++) {
        let row = calendar[calendar.length - 1];
        if (row.length >= 7) {
          calendar.push([]);
          row = calendar[calendar.length - 1];
        }
        // row.push(i);
        row.push(new Date(year, month, i));
      }
      const lastRow = calendar[calendar.length - 1];
      for (let i = lastRow.length, j = 1; i < 7; i++, j++) {
        // lastRow.push(j);
        lastRow.push(new Date(year, month + 1, j));
      }



      return wrapper('month', [
        header([
          button({
            onclick: () => this.setState_({ view: 'year' })
          }, [title(`${_.months[this.state.date.getMonth()]} ${this.state.date.getFullYear()}`)]),
          this.todayButton(),
          // button({ onclick: () => this.incMonth(-1), class: 'dec' }),
          // button({ onclick: () => this.incMonth(+1), class: 'inc' }),
        ]),
        table([
          days,
          ...calendar.map(row => row.map(date => {
            const selected = this.compareDate(date, this.state.date) && 'selected' || '';
            return button({
              onclick: () => {
                this.setState_({ date });
                (this.props.onselect || this.props.onSelect || (() => {}))(date);
              },
              class: selected,
            }, [date.getDate()]);
          })),
        ])
      ])
    }

    renderYear() {
      const months = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ];
      return wrapper('year', [
        header([
          button({ onclick: () => this.setState_({ view: 'decade' }) }, title(this.state.date.getFullYear())),
          this.todayButton(),
          // button({ onclick: () => this.incMonth(-12), class: 'dec' }),
          // button({ onclick: () => this.incMonth(+12), class: 'inc' }),
        ]),
        table(months.map(row => row.map(m => button({
          // class: this.compareMonth(new Date(this.state.date.getFullYear(), m - 1, this.state.date.getDate()), this.state.date) ? 'selected' : '',
          onclick: () => {
            const date = new Date(this.state.date);
            date.setMonth(m - 1);
            this.setState_({ date, view: 'month' });
          }
        }, [_.months[m - 1].substr(0, 3)])))),
      ])
    }
    renderDecade() {
      const year = this.state.date.getFullYear();
      const rounded = Math.floor(year / 10) * 10;
      const years = [
        [rounded - 1, rounded + 0, rounded + 1, rounded + 2],
        [rounded + 3, rounded + 4, rounded + 5, rounded + 6],
        [rounded + 7, rounded + 8, rounded + 9, rounded + 10],
        [rounded + 11, rounded + 12, rounded + 13, rounded + 14],
      ];
      return wrapper('decade', [header([
          button({ disabled: true }, [title(`${rounded}-${rounded+9}`)]),
          this.todayButton(),
          button({ onclick: () => this.incMonth(-120), class: 'dec' }),
          button({ onclick: () => this.incMonth(+120), class: 'inc' }),
        ]),
        table(years.map((row, i) => row.map((year, j) => button({
          onclick: () => {
            const date = new Date(this.state.date);
            date.setFullYear(year);
            this.setState_({ date, view: 'year' });
          }
        }, [year]))))
      ])
    }
  }
}
