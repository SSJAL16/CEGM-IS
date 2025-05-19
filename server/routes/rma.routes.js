router.patch('/:id/items/:itemIndex/images', async (req, res) => {
  try {
    const { id, itemIndex } = req.params;
    const { proof_images } = req.body;

    const rma = await RMA.findById(id);
    if (!rma) {
      return res.status(404).json({ message: 'RMA not found' });
    }

    // Update the proof_images array for the specific item
    rma.items[itemIndex].proof_images = proof_images;
    
    // Save the updated RMA
    const updatedRMA = await rma.save();
    
    res.json(updatedRMA);
  } catch (error) {
    console.error('Error updating proof images:', error);
    res.status(500).json({ message: 'Failed to update proof images' });
  }
}); 