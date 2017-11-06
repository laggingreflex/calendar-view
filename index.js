import * as _ from './utils.js';

export default (lib) => {
  const h = lib.h || lib.createComponent;
  const Component = lib.Component;
  // const this.wrapper = (wrapperClass, children) => h('div', { class: `calendar-view ${wrapperClass}` }, children);
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
      // console.log(`this.props.date:`, this.props.date);
      const date = new Date(this.props.date || new Date());
      // console.log(`date:`, date);
      this.setState_({ date, currentDate: date, });
    }

    componentWillReceiveProps(props) {
      // console.log(`componentWillReceiveProps:`, props);
      if (props.date) {
        // console.log(`props.date:`, props.date);
        const date = new Date(props.date);
        // console.log(`date:`, date);
        if (!isNaN(date.getTime())) {
          this.setState_({
            date,
            view: 'month'
          });
        }
      }
      // console.log(`componentWillReceiveProps:`, ...args);
    }

    wrapper(wrapperClass, children) {
      const classes = ['calendar-view', wrapperClass];
      if (this.state.browsing) {
        classes.push('browsing');
      }
      if (this.state.today) {
        classes.push('today');
      }
      return h('div', {
        class: classes.join(' '),
      }, children);
    }

    compareYear(a, b) { return a.getFullYear() === b.getFullYear() }
    compareMonth(a, b) { return this.compareYear(a, b) && a.getMonth() === b.getMonth() }
    compareDate(a, b) { return this.compareMonth(a, b) && a.getDate() === b.getDate() }

    // get date() { return new Date(this.state.date) }

    setState_(state) {
      // // console.log(new Error('setState'));
      // const before = this.state.date;
      // // console.log(`before:`, this.state.view);
      this.setState(state)
      // const after = this.state.date;
      // console.log(new Error(`${before} -> ${after}`));
    }


    todayButton() {
      const disabled = !Boolean(
        // this.state.currentDate !== this.state.date
        !this.compareDate(this.state.currentDate, this.state.date)
        || (this.state.view && this.state.view !== 'month')
      );
      // console.log(`todayButton:`, disabled);
      return button({
        disabled,
        onclick: () => {
          this.setState_({
            view: 'month',
            date: this.state.currentDate,
            browsing: true,
            today: true,
          });
          // this.onSelect(this.state.date);
        },
        title: 'Goto Today',
      }, ['•'])
    }

    onSelect(date) {
      (this.props.onselect || this.props.onSelect || (() => {}))(date, (new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString()).split('T')[0]);
    }

    incMonth(inc = 1) {
      // const date = this.date;
      const date = new Date(this.state.date);
      date.setMonth(date.getMonth() + inc);
      this.setState_({
        date,
        browsing: true,
        today: false,
      });
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



      return this.wrapper('month', [
        header([
          button({
            onclick: () => this.setState_({
              view: 'year',
              browsing: true,
              today: false,
            }),
            title: 'Switch to Year view',
          }, [title(`${_.months[this.state.date.getMonth()]} ${this.state.date.getFullYear()}`)]),
          this.todayButton(),
          button({
            onclick: () => this.incMonth(-1),
            class: 'dec',
            title: 'Previous Month',
            // title: _.months[this.state.date.getMonth() - 1],
          }),
          button({
            onclick: () => this.incMonth(+1),
            class: 'inc',
            // title: _.months[this.state.date.getMonth() + 1],
            title: 'Next Month',
          }),
        ]),
        table([
          days,
          ...calendar.map(row => row.map(date => {
            const selected = this.compareDate(date, this.state.date) && 'selected' || '';
            return button({
              onclick: () => {
                this.setState_({
                  date,
                  browsing: false,
                  today: false,
                });
                this.onSelect(date);
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
      return this.wrapper('year', [
        header([
          button({
            onclick: () => this.setState_({
              view: 'decade',
              browsing: true,
              today: false,
            }),
            title: 'Switch to Decade view',
          }, title(this.state.date.getFullYear())),
          this.todayButton(),
          button({
            onclick: () => this.incMonth(-12),
            class: 'dec',
            title: 'Previous Year',
          }),
          button({
            onclick: () => this.incMonth(+12),
            class: 'inc',
            title: 'Next Year',
          }),
        ]),
        table(months.map(row => row.map(m => button({
          // class: this.compareMonth(new Date(this.state.date.getFullYear(), m - 1, this.state.date.getDate()), this.state.date) ? 'selected' : '',
          onclick: () => {
            const date = new Date(this.state.date);
            date.setMonth(m - 1);
            this.setState_({
              date,
              view: 'month',
              browsing: true,
              today: false,
            });
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
      return this.wrapper('decade', [header([
          button({ disabled: true }, [title(`${rounded}-${rounded+9}`)]),
          this.todayButton(),
          button({
            onclick: () => this.incMonth(-120),
            class: 'dec',
            title: 'Previous Decade',
          }),
          button({
            onclick: () => this.incMonth(+120),
            class: 'inc',
            title: 'Next Decade',
          }),
        ]),
        table(years.map((row, i) => row.map((year, j) => button({
          onclick: () => {
            const date = new Date(this.state.date);
            date.setFullYear(year);
            this.setState_({
              date,
              view: 'year',
              browsing: true,
              today: false,
            });
          }
        }, [year]))))
      ])
    }
  }
}
