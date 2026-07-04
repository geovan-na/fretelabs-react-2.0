export default function Input({ 
    label, 
    name, 
    type = 'text', 
    value, 
    onChange, 
    error, 
    placeholder,
    required = false
}) {
    return (
        <div className="form-group">
            <label>
                {label} {required && <span>*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={error ? 'error' : ''}
            />
            {error && <span className="error-message">{error}</span>}
        </div>
    );
}

