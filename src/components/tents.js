export default class Tents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFetching: false,
      tents: [],
    };
  }
  async componentDidMount() {
    try {
      this.setState({ ...this.state, isFetching: true });
      const response = await fetch(`${window.location.href}api/tents/`);
      const json = await response.json();
      this.setState({ tents: json, isFetching: false });
    } catch (e) {
      console.log(e);
      this.setState({ ...this.state, isFetching: false });
    }
  }
  render() {
    return (
      <div className="c-sidebar">
        <a href="/kambyys/" className="c-sidebar-title">
          Kambüüs
        </a>
        <nav className="c-admin-nav">
          <ul className="u-list-blank">
            <li>
              <a href="/kambyys/nimekiri/">Nimekiri</a>
            </li>
            <li>
              <a href="/kambyys/arvegeneraator/">Arvegeneraator</a>
            </li>
            <li>
              <a href="/kambyys/telgid/">Telgid</a>
            </li>
            <li>
              <a href="/kambyys/lapsed/">Lapsed</a>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}
// export default class Tents extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       isFetching: false,
//       tents: [],
//     };
//   }
//
//   async getTentsInfo() {
//     try {
//       this.setState({ ...this.state, isFetching: true });
//       const response = await fetch(`${window.location.href}api/tents/`);
//       const json = await response.json();
//       this.setState({ tents: json, isFetching: false });
//     } catch (e) {
//       console.log(e);
//       this.setState({ ...this.state, isFetching: false });
//     }
//   }
//
//   render() {
//     if (this.state.isFetching) {
//       return <p>Fetching...</p>
//     }
//     return <div>Kek</div>;
//   }
// }
// let tentInfo;

// const populateTentless = () => {};
//
// const getTentsInfo = () => {
//   fetch(`${window.location.href}api/tents/`)
//     .then((response) => response.json())
//     .then((data) => (tentInfo = data))
//     .then(() => console.log(tentInfo))
//     .catch((err) => alert(err));
// };
//
// const suspend = promise => {
//     let result;
//     let status = "pending";
//     const suspender = promise.then(response => {
//         status = "success";
//         result = response;
//     }, error => {
//         status = "error";
//         result = error;
//     });
//
//     return () => {
//         switch(status) {
//             case "pending":
//                 throw suspender;
//             case "error":
//                 throw result;
//             default:
//                 return result;
//         }
//     };
// }

// const getTentInfo = () =>
//   fetch(`${window.location.href}api/tents/`).then((response) =>
//     response.json()
//   );

// const Tenters = () => {
//     const tenters = suspend(getTentInfo());
//     return (
//         <div>
//             <div className="c-tentless__container">{console.log(tenters())}</div>
//             <div className="c-tent__container"></div>
//         </div>
//     );
// }
//
// export default class Tents extends React.Component {
//   render() {
//     return (
//         <Suspense fallback={<p>Loading...</p>}>
//             <Tenters />
//         </Suspense>
//     );
//   }
// }
