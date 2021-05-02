import './Options.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Colors from '../Colors'

function Options({color, options, editOption, handleColorChange}){
    const renderIcon = (e, index) => {
        let classes = 'option-icon'
        if(e.name === editOption){
            classes += ' option-icon-active'
        }
        return(
            <FontAwesomeIcon key={index} className={classes} icon={e.icon} onClick={e.handler} />
        )
    }

    const renderColorBox = (e, index) => {
        let classes = 'color-box'
        if(e === color){
            classes += ' color-box-active'
        }
        return (
            <button key={index} onClick={()=>handleColorChange(e)} className={classes} style={{
                backgroundColor: `${e}`,
            }}>
            </button>
        );
    }
    return (
        <div className="options-outer-container">
            <div className="options-container">
                {Colors.map((e, index) => renderColorBox(e, index))}
            </div>
            <div className="options-container">
                {options.map((e, index) => renderIcon(e, index))}
            </div>
        </div>
    );
}

export default Options