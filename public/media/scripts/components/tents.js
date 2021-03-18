import _regeneratorRuntime from "babel-runtime/regenerator";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var getTentInfo = function getTentInfo() {
  return fetch(window.location.href + "api/tents/").then(function (response) {
    return response.json();
  });
};

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

var Tents = function (_React$Component) {
  _inherits(Tents, _React$Component);

  function Tents(props) {
    _classCallCheck(this, Tents);

    var _this = _possibleConstructorReturn(this, (Tents.__proto__ || Object.getPrototypeOf(Tents)).call(this, props));

    _this.state = {
      isFetching: false,
      tents: []
    };
    return _this;
  }

  _createClass(Tents, [{
    key: "getTentsInfo",
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
        var response, json;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;

                this.setState(Object.assign({}, this.state, { isFetching: true }));
                _context.next = 4;
                return fetch(window.location.href + "api/tents/");

              case 4:
                response = _context.sent;
                _context.next = 7;
                return response.json();

              case 7:
                json = _context.sent;

                this.setState({ tents: json, isFetching: false });
                _context.next = 15;
                break;

              case 11:
                _context.prev = 11;
                _context.t0 = _context["catch"](0);

                console.log(_context.t0);
                this.setState(Object.assign({}, this.state, { isFetching: false }));

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 11]]);
      }));

      function getTentsInfo() {
        return _ref.apply(this, arguments);
      }

      return getTentsInfo;
    }()
  }, {
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        null,
        "Kek"
      );
    }
  }]);

  return Tents;
}(React.Component);

export default Tents;