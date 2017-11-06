import * as preact from '//unpkg.com/preact?module';
import DatePickerFactory from '../index.js';

const DatePicker = DatePickerFactory(preact);
const { render, h, Component } = preact;

class App extends Component {
  render({}, { date }) {
    return h('div', {}, [
      h('input', {
        style: { display: 'block' },
        type: 'date',
        value: date,
        oninput: e => {
          this.setState({ date: e.target.value });
        }
      }),
      h(DatePicker, {
        style: { display: 'block' },
        date,
        onselect: (date, yyyymmdd) => this.setState({ date: yyyymmdd })
      }),
    ]);
  }
}

render(h(App), document.body);
