# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that helps users track their personal spending by recording transactions, organizing them into categories, and visualizing the distribution of expenses through an interactive pie chart. All data is persisted in the browser's LocalStorage — no server, account, or network connection is required. The app runs as a standalone HTML page and supports light and dark display modes.

---

## Glossary

- **App**: The Expense & Budget Visualizer web application as a whole.
- **Transaction**: A single spending record consisting of a name, a monetary amount (in Indonesian Rupiah), and a category.
- **Category**: A label used to group transactions. Categories can be one of the built-in defaults or a user-defined custom entry.
- **Balance**: The sum of all transaction amounts currently stored in the App.
- **Chart**: The pie chart that displays the proportion of total spending per category.
- **LocalStorage**: The browser-native key-value store used for client-side data persistence.
- **Formatter**: The Intl.NumberFormat instance that converts numeric amounts into IDR currency strings.
- **Sorter**: The logic responsible for ordering the transaction list according to the selected sort criterion.
- **Theme**: The active color scheme — either `light` or `dark`.

---

## Requirements

### Requirement 1: Transaction Recording

**User Story:** As a user, I want to add a new expense transaction with a name, amount, and category, so that I can keep a record of what I have spent.

#### Acceptance Criteria

1. THE App SHALL provide a form containing an item-name text field accepting up to 100 characters, an amount numeric field accepting values from 0.01 to 999,999,999.99, and a category dropdown with at least one selectable option.
2. WHEN the user submits the form with a non-empty item name, a numeric amount between 0.01 and 999,999,999.99 inclusive, and a selected category, THE App SHALL append a new Transaction object containing the item name, amount, category, and a timestamp of the submission time to the transactions list.
3. WHEN the user submits the form with any field left empty or unselected, THE App SHALL display an inline validation error message adjacent to each invalid field and SHALL NOT add a transaction.
4. WHEN the user submits the form with an amount that is zero, negative, or greater than 999,999,999.99, THE App SHALL display an inline validation error message adjacent to the amount field and SHALL NOT add a transaction.
5. WHEN the user submits the form with an item name exceeding 100 characters, THE App SHALL display an inline validation error message adjacent to the item-name field and SHALL NOT add a transaction.
6. WHEN a transaction is successfully added, THE App SHALL clear all form fields to their default empty or unselected state and SHALL move focus to the item-name field within 100 milliseconds.
7. WHEN a transaction is successfully added, THE App SHALL persist the updated transactions list to LocalStorage under the key `ebv_transactions`.

---

### Requirement 2: Transaction Deletion

**User Story:** As a user, I want to delete a transaction I no longer need, so that my expense history stays accurate.

#### Acceptance Criteria

1. THE App SHALL render a delete button for each transaction entry displayed in the transaction list.
2. WHEN the user activates the delete button for a transaction, THE App SHALL remove that transaction from the transactions list, matching the transaction by its unique identifier.
3. IF the transaction to be deleted is not found in the transactions list, THEN THE App SHALL leave the transactions list unchanged and display an error message indicating the deletion could not be completed.
4. WHEN a transaction is deleted, THE App SHALL persist the updated transactions list to LocalStorage under the key `ebv_transactions`, overwriting the previous value.
5. WHEN a transaction is deleted, THE App SHALL re-render the transaction list, the balance display, and the chart within 100 milliseconds to reflect the removal.

---

### Requirement 3: Transaction List Display

**User Story:** As a user, I want to see all my recorded transactions in a list, so that I can review my spending history.

#### Acceptance Criteria

1. THE App SHALL render each transaction as a list item showing the transaction name (up to 50 characters), the amount formatted with a currency symbol and two decimal places, and a category chip displaying the category label.
2. WHILE the transactions list is empty, THE App SHALL display an empty-state message in place of the list.
3. WHILE the transactions list is non-empty, THE App SHALL hide the empty-state message.
4. THE App SHALL limit the visible height of the transaction list to a maximum of 10 visible items and enable vertical scrolling when the number of items exceeds the visible area.
5. WHEN the transactions list is rendered, THE App SHALL display transactions ordered by entry date from most recent to oldest.
6. IF a transaction record is missing the name, amount, or category, THEN THE App SHALL exclude that record from the list and continue rendering the remaining valid transactions.

---

### Requirement 4: Transaction Sorting

**User Story:** As a user, I want to sort my transactions by different criteria, so that I can view them in the order most useful to me.

#### Acceptance Criteria

1. THE App SHALL provide a sort control with exactly four options: "newest first", "highest amount", "lowest amount", and "category (A–Z)".
2. WHEN the user selects "newest first", THE Sorter SHALL order transactions by descending insertion order such that the transaction added most recently appears first in the displayed list.
3. WHEN the user selects "highest amount", THE Sorter SHALL order transactions by descending absolute amount such that the transaction with the numerically largest amount appears first; IF two transactions have equal amounts, THEN THE Sorter SHALL preserve their relative insertion order (stable sort).
4. WHEN the user selects "lowest amount", THE Sorter SHALL order transactions by ascending absolute amount such that the transaction with the numerically smallest amount appears first; IF two transactions have equal amounts, THEN THE Sorter SHALL preserve their relative insertion order (stable sort).
5. WHEN the user selects "category (A–Z)", THE Sorter SHALL order transactions by ascending lexicographic (Unicode code-point) order of their category label, case-insensitively; IF two transactions share the same category label, THEN THE Sorter SHALL preserve their relative insertion order (stable sort).
6. WHEN the user changes the sort selection, THE App SHALL write the selected sort criterion value to LocalStorage under the key `ebv_sort` before updating the displayed list.
7. WHEN the App initializes, IF a valid sort criterion value is stored in LocalStorage under the key `ebv_sort`, THEN THE App SHALL apply that criterion to the initial render without requiring any user interaction.
8. WHEN the App initializes, IF no value or an unrecognized value is stored in LocalStorage under the key `ebv_sort`, THEN THE App SHALL default to "newest first" for the initial render.

---

### Requirement 5: Category Management

**User Story:** As a user, I want to choose from predefined categories and add my own custom ones, so that I can organize transactions in a way that reflects my spending habits.

#### Acceptance Criteria

1. THE App SHALL initialize with three default categories: Food, Transport, and Fun.
2. THE App SHALL populate the category dropdown with the current categories list on every render.
3. WHEN the user submits a category name via the custom-category input where the trimmed value is non-empty and does not match any existing category name (case-insensitive), THE App SHALL append the trimmed category name to the categories list.
4. WHEN the user submits a category name via the custom-category input where the trimmed value is an empty string, THE App SHALL display an inline validation error message indicating the name cannot be blank, SHALL NOT modify the categories list, and SHALL clear that validation error when the user next successfully adds a category.
5. WHEN the user submits a category name that matches an existing category name (case-insensitive comparison after trimming), THE App SHALL display an inline validation error message indicating the category already exists and SHALL NOT add a duplicate entry to the categories list.
6. WHEN a custom category is successfully added, THE App SHALL persist the updated categories list to LocalStorage under the key `ebv_categories`.
7. WHEN a custom category is successfully added, THE App SHALL select that new category in the dropdown automatically.
8. WHEN the App initializes, THE App SHALL restore the previously saved categories list from LocalStorage under the key `ebv_categories`, falling back to the three default categories if no saved value exists or if the saved value is not a valid non-empty array of strings.
9. IF the categories list already contains 20 entries, THEN THE App SHALL display an inline validation error message indicating the category limit has been reached and SHALL NOT add the new category.

---

### Requirement 6: Balance and Summary Display

**User Story:** As a user, I want to see the total of all my expenses and a transaction count at a glance, so that I always know my current spending total.

#### Acceptance Criteria

1. THE App SHALL display a total balance equal to the sum of all transaction amounts.
2. THE Formatter SHALL format all monetary values using the `id-ID` locale with the IDR currency symbol and zero decimal places.
3. WHEN the transactions list is empty, THE App SHALL display "No transactions yet" as the transaction count label.
4. WHEN the transactions list contains exactly one transaction, THE App SHALL display "1 transaction" as the transaction count label.
5. WHEN the transactions list contains more than one transaction, THE App SHALL display the count followed by " transactions" (with a space separator) as the transaction count label.
6. WHEN any transaction is added or deleted, THE App SHALL update the balance and count display within the same render cycle as the triggering change, without requiring a page reload.

---

### Requirement 7: Spending Chart Visualization

**User Story:** As a user, I want to see a pie chart that shows how my spending is distributed across categories, so that I can identify where most of my money goes.

#### Acceptance Criteria

1. THE App SHALL render a pie chart using Chart.js that shows one slice per spending category with at least one recorded expense transaction, sized proportionally to that category's total absolute amount relative to the sum of all displayed categories' totals.
2. WHILE the transactions list contains no expense transactions, THE App SHALL hide the chart canvas and display an empty-state message of no longer than 100 characters in its place.
3. WHEN the transactions list transitions from empty to non-empty with at least one expense transaction, THE App SHALL show the chart canvas and hide the empty-state message within 300 milliseconds.
4. WHEN a transaction is added or deleted, THE App SHALL update the existing chart instance's data and labels to reflect the current category totals without destroying and recreating the chart instance.
5. THE Chart SHALL display a legend positioned at the bottom of the chart canvas, with each label's text color matching the foreground color defined by the active theme.
6. WHEN the user hovers a pointer over a pie slice, THE Chart SHALL display a tooltip containing the category label and the category's total amount formatted as IDR currency with zero decimal places (e.g., "Rp 150.000").
7. IF the transactions list contains no expense transactions when the page loads, THE App SHALL display the empty-state message and hide the chart canvas on initial render without waiting for a user interaction.

---

### Requirement 8: Category Color Assignment

**User Story:** As a user, I want each category to have a consistent, distinct color in the chart and chips, so that I can recognize categories at a glance.

#### Acceptance Criteria

1. THE App SHALL assign a fixed color to each of the three default categories: the first default category receives one predefined color, the second receives a visually distinct predefined color, and the third receives a third visually distinct predefined color.
2. WHEN a category's zero-based index is 3 or greater, THE App SHALL generate that category's color using an HSL value where the hue equals (index × 67) modulo 360, saturation is 60%, and lightness is 55%.
3. THE App SHALL apply the color derived from criteria 1 or 2 to both the corresponding chart slice and all color-coded UI elements (such as category chips) associated with that category, such that no two simultaneously displayed categories share the same generated color when their indices differ.
4. WHEN a new category is added, THE App SHALL assign its color based on its zero-based position in the category list using the rules in criteria 1 and 2, and that color assignment SHALL remain unchanged for the lifetime of that category.

---

### Requirement 9: Theme Switching

**User Story:** As a user, I want to switch between light and dark modes, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE App SHALL provide a theme-toggle button in the header that switches between light and dark themes, applying the selected theme's styles to all visible UI elements including background colors, text colors, and component surfaces.
2. WHEN the theme is light, THE App SHALL display a moon icon on the toggle button with the aria-label "Switch to dark mode".
3. WHEN the theme is dark, THE App SHALL display a sun icon on the toggle button with the aria-label "Switch to light mode".
4. WHEN the user activates the theme-toggle button, THE App SHALL switch to the opposite theme.
5. WHEN the theme changes, THE App SHALL persist the selected theme to LocalStorage under the key `ebv_theme`.
6. IF LocalStorage is unavailable when the App attempts to persist the theme, THEN THE App SHALL apply the selected theme for the current session without displaying an error to the user.
7. WHEN the App initializes without a saved theme preference and the user's operating system reports a preference for dark color scheme, THE App SHALL apply the dark theme.
8. WHEN the App initializes without a saved theme preference and the user's operating system does not report a preference for dark color scheme, THE App SHALL apply the light theme.
9. WHEN the App initializes with a saved theme preference, THE App SHALL apply that saved theme regardless of the operating-system preference.
10. WHEN the theme changes, THE App SHALL update the chart legend label color to match the text color defined by the active theme's style.

---

### Requirement 10: Data Persistence and Initialization

**User Story:** As a user, I want my transactions, categories, sort preference, and theme to be remembered across browser sessions, so that I do not have to re-enter data every time I open the app.

#### Acceptance Criteria

1. THE App SHALL write all mutable state (transactions, categories, sort criterion, theme) to LocalStorage under their respective keys whenever any single state value changes, completing the write before the next user interaction is processed.
2. WHEN the App initializes, THE App SHALL read each state value from LocalStorage and apply it to the corresponding in-memory state; IF a key is absent or the stored value cannot be parsed as the expected data type (array for transactions and categories, string for sort criterion and theme), THEN THE App SHALL substitute the defined default value for that key without affecting the other keys.
3. IF a LocalStorage write operation fails, THEN THE App SHALL retain the updated state in memory for the current session and continue operating without displaying an error message to the user.
4. WHEN the App initializes, THE App SHALL populate the category dropdown, sort control, transaction list, balance display, and chart from the restored in-memory state before rendering any interactive UI element visible to the user.
5. THE App SHALL define the following default values used when a LocalStorage key is absent or malformed: an empty array for transactions, the built-in category list for categories, the default sort criterion, and the default theme.

---

### Requirement 11: Accessibility

**User Story:** As a user relying on assistive technologies or keyboard navigation, I want the app to be navigable and understandable without a mouse, so that I can use it regardless of my input method or ability.

#### Acceptance Criteria

1. WHEN a user navigates via keyboard, THE App SHALL display a focus indicator on the currently focused interactive element (inputs, selects, buttons) with a visible outline that has a contrast ratio of at least 3:1 against the adjacent background color.
2. THE App SHALL associate every form input with a visible `<label>` element using matching `for` and `id` attributes.
3. THE App SHALL apply `role="alert"` and `aria-live="polite"` to elements that display dynamic content updates, including inline validation error messages and transaction operation feedback messages, so assistive technologies announce changes.
4. THE App SHALL supply an `aria-label` attribute on the chart canvas describing its purpose as a pie chart of spending by category.
5. THE App SHALL supply a `class="sr-only"` visually-hidden label for the sort dropdown so screen readers can identify the control.
6. THE App SHALL supply `aria-label` attributes on icon-only and action buttons (theme toggle, delete buttons) that describe the button's specific action (e.g., indicating the theme being toggled to, or the transaction being deleted).

---

### Requirement 12: Responsive Layout

**User Story:** As a user on any device, I want the app layout to adapt to my screen width, so that it is usable on both desktop and mobile.

#### Acceptance Criteria

1. WHILE the viewport width is less than 768 px, THE App SHALL display the transaction list and spending chart stacked vertically in a single-column layout, each occupying 100% of the available content width.
2. WHEN the viewport width is 768 px or wider, THE App SHALL display the transaction list and spending chart side by side in a two-column layout, each column occupying no less than 40% and no more than 60% of the available content width.
3. THE App SHALL constrain its maximum content width to 960 px and center the layout horizontally on viewports wider than 960 px.
4. IF the viewport width changes while the App is displayed (e.g., browser window resize or device orientation change), THEN THE App SHALL update the layout to match the applicable column configuration within 100 ms without requiring a page reload.

---

### Requirement 13: Non-Functional Constraints

**User Story:** As a developer or reviewer, I want the app to be built with plain web technologies and minimal dependencies, so that it is easy to inspect, deploy, and maintain without a build step.

#### Acceptance Criteria

1. THE App SHALL be implemented using HTML, CSS, and vanilla JavaScript only, with no JavaScript frameworks or build tools required.
2. THE App SHALL load Chart.js from a CDN and SHALL NOT require any other runtime dependencies.
3. THE App SHALL store all data client-side in LocalStorage and SHALL NOT make any network requests to a backend server.
4. THE App SHALL function correctly as a standalone file opened directly in a modern browser (Chrome, Firefox, Edge, Safari) without a local server.
5. IF the user's operating system has enabled reduced-motion preferences, THEN THE App SHALL disable all CSS transitions and animations such that no motion-based visual changes occur during interaction.
6. IF Chart.js fails to load from the CDN, THEN THE App SHALL display a user-visible message indicating that the chart is unavailable and continue to operate all non-chart functionality normally.
7. THE App SHALL complete its initial load and render within 3 seconds when opened as a standalone file on a modern desktop device with a standard internet connection.
