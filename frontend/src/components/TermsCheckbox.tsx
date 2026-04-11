
import { CheckIcon } from "lucide-react";

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const TermsCheckbox = ({ checked, onChange }: TermsCheckboxProps) => {
  return (
    <div className="flex items-start space-x-2">
      <div className="relative flex items-center">
        <input 
          type="checkbox" 
          id="terms" 
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div 
          className={`w-5 h-5 ${checked ? 'bg-trustBlue' : 'bg-white dark:bg-gray-700'} 
            border ${checked ? 'border-trustBlue' : 'border-gray-300 dark:border-gray-600'} 
            rounded flex items-center justify-center transition-colors cursor-pointer`}
          onClick={() => onChange(!checked)}
        >
          {checked && <CheckIcon className="h-3 w-3 text-white" />}
        </div>
      </div>
      <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer" onClick={() => onChange(!checked)}>
        I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a>, <a href="#" className="text-primary hover:underline">Privacy Policy</a>, and understand that my application will be reviewed before approval
      </label>
    </div>
  );
};

export default TermsCheckbox;
