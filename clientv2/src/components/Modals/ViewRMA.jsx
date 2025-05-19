import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { generateCustomRMAId, generateCustomGRNId } from '../../customize/customizeId';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Zoom from '@mui/material/Zoom';
import Badge from '@mui/material/Badge';
import { MdShoppingBag } from 'react-icons/md';
import logo from '../../assets/images/cokins-logo.png';

const ViewRMA = ({ open, handleClose, rma }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  if (!rma) return null;

  const getStatusColor = (status) => {
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
      aria-labelledby="rma-details-modal"
      aria-describedby="rma-details-description"
      BackdropProps={{
        timeout: 500,
      }}
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
          <Paper 
            elevation={0}
            sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 2,
              position: 'relative',
              mb: 3
            }}
          >
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
                RMA Details
              </Typography>
              <Chip
                label={rma.return_status}
                sx={{
                  bgcolor: getStatusColor(rma.return_status),
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
                      <strong>RMA ID:</strong> {generateCustomRMAId(rma._id)}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>GRN ID:</strong> {generateCustomGRNId(rma.grn.grn_id)}
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
                      <strong>Return Date:</strong> {rma.return_date ? new Date(rma.return_date).toLocaleDateString() : 'Not set'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Created At:</strong> {new Date(rma.createdAt).toLocaleDateString()}
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
                          <strong>Company Name:</strong> {rma.supplier.company_name}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Company Email:</strong> {rma.supplier.company_email}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Contact Person:</strong> {rma.supplier.person_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body1" gutterBottom>
                          <strong>Contact Number:</strong> {rma.supplier.person_number}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Address:</strong> {`${rma.supplier.company_city}, ${rma.supplier.company_province}, ${rma.supplier.company_country}`}
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
                      <Badge badgeContent={rma.items.length} color="primary" sx={{ mr: 2 }}>
                        <MdShoppingBag size={24} />
                      </Badge>
                      <Typography variant="h6">Return Items</Typography>
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
                            <th style={{ padding: '16px' }}>Product Name</th>
                            <th style={{ padding: '16px' }}>Description</th>
                            <th style={{ padding: '16px' }}>Return Quantity</th>
                            <th style={{ padding: '16px' }}>Unit Price</th>
                            <th style={{ padding: '16px' }}>Reason</th>
                            <th style={{ padding: '16px' }}>Proof Images</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rma.items.map((item, index) => (
                            <tr key={index} style={{
                              background: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.paper,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              transition: 'transform 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                              }
                            }}>
                              <td style={{ padding: '16px' }}>{item.product_Name}</td>
                              <td style={{ padding: '16px' }}>{item.product_Description}</td>
                              <td style={{ padding: '16px' }}>
                                <Chip 
                                  label={item.return_quantity}
                                  color="primary"
                                  size="small"
                                />
                              </td>
                              <td style={{ padding: '16px' }}>
                                <Typography color="primary">
                                  ₱{item.product_Price}
                                </Typography>
                              </td>
                              <td style={{ padding: '16px' }}>{item.reason || 'N/A'}</td>
                              <td style={{ padding: '16px' }}>
                                {item.proof_images && item.proof_images.length > 0 ? (
                                  <ImageList 
                                    sx={{ 
                                      width: 200, 
                                      height: 150,
                                      '& .MuiImageListItem-root': {
                                        overflow: 'hidden',
                                        borderRadius: 1,
                                        transition: 'transform 0.3s ease-in-out',
                                        '&:hover': {
                                          transform: 'scale(1.05)',
                                        }
                                      }
                                    }} 
                                    cols={2} 
                                    rowHeight={100}
                                  >
                                    {item.proof_images.map((image, imgIndex) => (
                                      <ImageListItem 
                                        key={imgIndex}
                                        sx={{
                                          cursor: 'pointer',
                                          '&:hover img': {
                                            transform: 'scale(1.1)',
                                          }
                                        }}
                                      >
                                        <img
                                          src={image.url}
                                          alt={`Proof ${imgIndex + 1}`}
                                          loading="lazy"
                                          style={{
                                            transition: 'transform 0.3s ease-in-out',
                                          }}
                                          onClick={() => window.open(image.url, '_blank')}
                                        />
                                      </ImageListItem>
                                    ))}
                                  </ImageList>
                                ) : (
                                  <Chip 
                                    label="No images" 
                                    variant="outlined" 
                                    size="small"
                                    color="warning"
                                  />
                                )}
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

export default ViewRMA; 