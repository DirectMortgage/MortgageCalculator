import { Fragment } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";

function ButtonDropdown({ title, options = [], onChange = () => {} }) {
  return (
    <DropdownButton id="dropdown-basic-button" title={title}>
      {options.map((item, index) => {
        return (
          <Fragment key={item["value"]}>
            <Dropdown.Item onClick={() => onChange({ item, index })}>
              {item["label"]}
            </Dropdown.Item>
          </Fragment>
        );
      })}
    </DropdownButton>
  );
}

export default ButtonDropdown;
