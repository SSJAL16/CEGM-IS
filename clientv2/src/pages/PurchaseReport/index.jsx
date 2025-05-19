import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import ReportPO from "../../components/Modals/Reports/ReportPO";
import ReportGRN from "../../components/Modals/Reports/ReportGRN";
import ReportBO from "../../components/Modals/Reports/ReportBO";
import ReportRMA from "../../components/Modals/Reports/ReportRMA";
import ReportSupplier from "../../components/Modals/Reports/ReportSupplier";

const Reports = () => {
  const [openPO, setOpenPO] = useState(false);
  const [openGRN, setOpenGRN] = useState(false);
  const [openBO, setOpenBO] = useState(false);
  const [openRMA, setOpenRMA] = useState(false);
  const [openSupplier, setOpenSupplier] = useState(false);

  const handleOpenPO = () => setOpenPO(true);
  const handleOpenGRN = () => setOpenGRN(true);
  const handleOpenBO = () => setOpenBO(true);
  const handleOpenRMA = () => setOpenRMA(true);
  const handleOpenSupplier = () => setOpenSupplier(true);

  const handleClosePO = () => setOpenPO(false);
  const handleCloseGRN = () => setOpenGRN(false);
  const handleCloseBO = () => setOpenBO(false);
  const handleCloseRMA = () => setOpenRMA(false);
  const handleCloseSupplier = () => setOpenSupplier(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Reports</h5>
        </div>
        <div className="card shadow border- p-3 mt-4">
          <h3 className="hd">Purchase Reports</h3>

          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <div className="card shadow border-0 p-3 h-100 d-flex flex-column justify-content-between">
                <div>
                  <h5>Purchase Order</h5>
                  <p className="mb-3 text-muted">
                    View and generate reports for purchase orders.
                  </p>
                </div>
                <div className="text-end">
                  <Button onClick={handleOpenPO} variant="contained">
                    GENERATE
                  </Button>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <div className="card shadow border-0 p-3 h-100 d-flex flex-column justify-content-between">
                <div>
                  <h5>Goods Received Note</h5>
                  <p className="mb-3 text-muted">
                    Generate detailed reports for received goods.
                  </p>
                </div>
                <div className="text-end">
                  <Button onClick={handleOpenGRN} variant="contained">
                    GENERATE
                  </Button>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <div className="card shadow border-0 p-3 h-100 d-flex flex-column justify-content-between">
                <div>
                  <h5>RMA</h5>
                  <p className="mb-3 text-muted">
                    Generate reports for returned materials authorization.
                  </p>
                </div>
                <div className="text-end">
                  <Button onClick={handleOpenRMA} variant="contained">
                    GENERATE
                  </Button>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <div className="card shadow border-0 p-3 h-100 d-flex flex-column justify-content-between">
                <div>
                  <h5>Backorder</h5>
                  <p className="mb-3 text-muted">
                    View reports for pending or backordered items.
                  </p>
                </div>
                <div className="text-end">
                  <Button onClick={handleOpenBO} variant="contained">
                    GENERATE
                  </Button>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <div className="card shadow border-0 p-3 h-100 d-flex flex-column justify-content-between">
                <div>
                  <h5>Supplier</h5>
                  <p className="mb-3 text-muted">
                    Generate reports for supplier information and history.
                  </p>
                </div>
                <div className="text-end">
                  <Button onClick={handleOpenSupplier} variant="contained">
                    GENERATE
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <ReportPO open={openPO} handleClose={handleClosePO} />
          <ReportGRN open={openGRN} handleClose={handleCloseGRN} />
          <ReportBO open={openBO} handleClose={handleCloseBO} />
          <ReportRMA open={openRMA} handleClose={handleCloseRMA} />
          <ReportSupplier open={openSupplier} handleClose={handleCloseSupplier} />
        </div>
      </div>
    </>
  );
};

export default Reports;
