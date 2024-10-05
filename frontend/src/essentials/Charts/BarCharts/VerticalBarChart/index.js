import { useMemo } from "react";

// porp-types is a library for typechecking of props
import PropTypes from "prop-types";

// react-chartjs-2 components
import { Bar } from "react-chartjs-2";

// @mui material components
import Card from "@mui/material/Card";

// React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import AbsoluteLoading from "components/General/AbsoluteLoading";

// VerticalBarChart configurations
import configs from "essentials/Charts/BarCharts/VerticalBarChart/configs";

// React base styles
import colors from "assets/theme/base/colors";

function VerticalBarChart({ title, description, height, chart, nodata, loading }) {
  const chartDatasets = chart.datasets
    ? chart.datasets.map((dataset) => ({
        ...dataset,
        weight: 15,
        borderWidth: 0,
        // borderRadius: 5,  
        backgroundColor: colors[dataset.color]
          ? colors[dataset.color || "dark"].main
          : colors.dark.main,
        fill: false,
        maxBarThickness: 10, 
        // borderSkipped: 'start'
        // borderSkipped: {
        //   top: 5,    // Radius for the top
        //   bottom: 5, // Radius for the bottom
        // },
      }))
    : [];

  const { data, options } = configs(chart.labels || [], chartDatasets);

  const renderChart = (
    <SoftBox p={2}>
      {title || description ? (
        <SoftBox px={description ? 1 : 0} pt={description ? 1 : 0}>
          {title && (
            <SoftBox mb={0}>
              <SoftTypography variant="h6">{title}</SoftTypography>
            </SoftBox>
          )}
          <SoftBox mb={0}>
            <SoftTypography component="div" variant="button" fontWeight="regular" color="white">
              {description}
            </SoftTypography>
          </SoftBox>
        </SoftBox>
      ) : null}
      {useMemo(
        () => (
          <SoftBox display="flex" height={height}>
            {loading ? 
              <AbsoluteLoading /> 
              : !nodata ? 
                <Bar data={data} options={options} /> 
                : <SoftTypography className="text-sm m-auto">No data to fetch</SoftTypography> }
          </SoftBox>
        ),
        [chart, height]
      )}
    </SoftBox>
  );

  return title || description ? <Card>{renderChart}</Card> : renderChart;
}

// Setting default values for the props of VerticalBarChart
VerticalBarChart.defaultProps = {
  title: "",
  description: "",
  height: "19.125rem",
};

// Typechecking props for the VerticalBarChart
VerticalBarChart.propTypes = {
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  chart: PropTypes.objectOf(PropTypes.array).isRequired,
};

export default VerticalBarChart;
