import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Zoom from '@mui/material/Zoom';
import Badge from '@mui/material/Badge';
import { MdShoppingBag } from 'react-icons/md';
import { generateCustomGRNId, generateCustomPurchaseOrderId } from '../../customize/customizeId';
import logo from '../../assets/images/cokins-logo.png';

const ViewGRN = ({ open, handleClose, grn }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  if (!grn) return null;

  const getStatusColor = (status) => {
    if (!status) return '#2196f3'; // Default color if status is undefined
    
    switch (status.toLowerCase()) {
      case 'draft':
        return '#ff9800';
      case 'approved':
        return '#4caf50';
      case 'archived':
        return '#9e9e9e';
      default:
        return '#2196f3';
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      aria-labelledby="grn-details-modal"
      aria-describedby="grn-details-description"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        overflow: 'auto',
        padding: 2
      }}
    >
      <Zoom in={open}>
        <Box
          sx={{
            position: 'relative',
            width: isMobile ? '95%' : isTablet ? '90%' : '80%',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: { xs: 2, sm: 3, md: 4 },
            overflowY: 'auto',
            mx: 'auto',
            my: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.mode === 'dark' ? '#333' : '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.mode === 'dark' ? '#666' : '#888',
              borderRadius: '4px',
            },
            outline: 'none',
          }}
        >
          <Paper elevation={0} sx={{ bgcolor: 'background.paper', borderRadius: 2, position: 'relative', mb: 3 }}>
            <IconButton
              aria-label="close modal"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'text.secondary',
              }}
            >
              <CloseIcon />
            </IconButton>

            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <img 
                  src={logo} 
                  alt="Cokins Logo" 
                  style={{ 
                    height: '80px', 
                    width: 'auto',
                    marginBottom: '1.5rem' 
                  }} 
                />
              </Box>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Goods Received Note Details
              </Typography>
              <Chip
                label={grn.order_status}
                sx={{
                  bgcolor: getStatusColor(grn.order_status),
                  color: 'white',
                  fontSize: '1rem',
                  py: 0.5,
                }}
              />
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocalShippingIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Reference Information</Typography>
                    </Box>
                    <Typography variant="body1" gutterBottom>
                      <strong>GRN ID:</strong> {generateCustomGRNId(grn._id)}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>PO ID:</strong> {generateCustomPurchaseOrderId(grn.po.po_id)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Dates</Typography>
                    </Box>
                    <Typography variant="body1" gutterBottom>
                      <strong>Received Date:</strong> {grn.received_date ? new Date(grn.received_date).toLocaleDateString() : 'Not set'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Created At:</strong> {new Date(grn.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Supplier Information</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Company Name:</strong> {grn.supplier.company_name}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Company Email:</strong> {grn.supplier.company_email}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Contact Person:</strong> {grn.supplier.person_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Contact Number:</strong> {grn.supplier.person_number}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Address:</strong> {`${grn.supplier.company_city}, ${grn.supplier.company_province}, ${grn.supplier.company_country}`}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Badge badgeContent={grn.items.length} color="primary" sx={{ mr: 2 }}>
                        <MdShoppingBag size={24} />
                      </Badge>
                      <Typography variant="h6">Received Items</Typography>
                    </Box>
                    <Box sx={{ overflowX: 'auto' }}>
                      <table className="table table-hover" style={{ 
                        borderCollapse: 'separate',
                        borderSpacing: '0 8px',
                        width: '100%',
                      }}>
                        <thead>
                          <tr style={{ 
                            background: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                          }}>
                            <th style={{ padding: '16px', whiteSpace: 'nowrap' }}>Product Name</th>
                            <th style={{ padding: '16px', whiteSpace: 'nowrap' }}>Description</th>
                            <th style={{ padding: '16px', whiteSpace: 'nowrap' }}>Received Quantity</th>
                            <th style={{ padding: '16px', whiteSpace: 'nowrap' }}>Unit Price</th>
                            <th style={{ padding: '16px', whiteSpace: 'nowrap' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grn.items.map((item, index) => (
                            <tr key={index}>
                              <td style={{ padding: '16px' }}>{item.product_Name}</td>
                              <td style={{ padding: '16px' }}>{item.product_Description}</td>
                              <td style={{ padding: '16px' }}>
                                <Chip 
                                  label={item.received_quantity}
                                  color="primary"
                                  size="small"
                                />
                              </td>
                              <td style={{ padding: '16px' }}>
                                <Typography color="primary">
                                  ₱{item.product_Price.toFixed(2)}
                                </Typography>
                              </td>
                              <td style={{ padding: '16px' }}>
                                <Typography color="primary">
                                  ₱{(item.received_quantity * item.product_Price).toFixed(2)}
                                </Typography>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Zoom>
    </Modal>
  );
};

export default ViewGRN; 