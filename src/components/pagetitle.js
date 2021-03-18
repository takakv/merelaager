export default class Pagetile extends React.Component {
    render() {
        return(
            <div className="admin-page__title">
                <span>{this.props.title}</span>
            </div>
        )
    }
}
