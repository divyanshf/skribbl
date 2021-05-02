function Title (props) {
    return(
        <div id='title' style={{
            fontSize: `${props.size}`,
            textAlign: `${props.align}`
        }}>
            <span data-content="s" className="title-span" style={{
                color:'red',
            }}>s</span>
            <span data-content="k" className="title-span" style={{
                color:'orangered',
            }}>k</span>
            <span data-content="r" className="title-span" style={{
                color:'yellow',
            }}>r</span>
            <span data-content="i" className="title-span" style={{
                color:'green',
            }}>i</span>
            <span data-content="b" className="title-span" style={{
                color:'skyblue',
            }}>b</span>
            <span data-content="b" className="title-span" style={{
                color:'blue',
            }}>b</span>
            <span data-content="l" className="title-span" style={{
                color:'purple',
            }}>l</span>
        </div>
    );
}

export default Title