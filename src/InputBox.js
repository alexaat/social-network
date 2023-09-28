const InputBox = ({placeholder, readOnly, clickHandler}) => {
    return (
        <input type="text" placeholder={placeholder} readOnly={readOnly} onClick={clickHandler}/>
     );
}
 
export default InputBox;