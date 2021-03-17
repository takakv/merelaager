export default class Userbox extends React.Component {
    render() {
        return(
            <div className="admin-page__user">
                <span>{this.props.name}</span>
            </div>

        )
    }
}
