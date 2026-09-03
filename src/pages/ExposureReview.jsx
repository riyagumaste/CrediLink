<div className="exposure-toolbar">

  <div>
    <p className="section-label">
      COUNTERPARTY EXPOSURE
    </p>

    <h2>
      Exposure by Business
    </h2>
  </div>

  <div className="exposure-filter">

    <label htmlFor="risk-filter">
      Filter by Risk
    </label>

    <select
      id="risk-filter"
      defaultValue="all"
    >
      <option value="all">
        All Risk Levels
      </option>

      <option value="high">
        High Risk
      </option>

      <option value="medium">
        Medium Risk
      </option>

      <option value="low">
        Low Risk
      </option>
    </select>

  </div>

</div>