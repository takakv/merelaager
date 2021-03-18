import Sidebar from "./components/sidebar.js";
import Userbox from "./components/userbox.js";
import Pagetile from "./components/pagetitle.js";
import Tents from "./components/tents.js";

console.log(`${window.location.href}api/tents/`);

class Home extends React.Component {
  render() {
    return (
      <div className="admin-page">
        <Sidebar></Sidebar>
        <Pagetile title="Ahoi"></Pagetile>
        <Userbox name="Taaniel"></Userbox>
        <main role="main" className="c-content">
            <Tents></Tents>
        </main>
      </div>
    );
  }
}

ReactDOM.render(
  //<BrowserRouter>
  <Home />,
  //</BrowserRouter>,
  document.getElementById("app")
);
