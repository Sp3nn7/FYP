import { render, fireEvent, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import TrendSelector from "../components/TrendSelector";

/**
 * Set active item in trend selector
 */
test("trend selector", () => {
const mockUpdate = jest.fn();
const items = ["Fish", "Bread", "Rice"];
// render the component on virtual dom
render(<TrendSelector items={items} active={items[0]} unit={"1 kg"} update={mockUpdate}/>);

//select the elements you want to interact with
const fish = screen.getByTestId("Fish");
const bread = screen.getByTestId("Bread");

expect(fish.classList.contains("active")).toBe(true)
expect(bread.classList.contains("active")).toBe(false)

//interact with those elements
fireEvent.click(bread);
expect(mockUpdate).lastCalledWith(items.indexOf("Bread"));
});
