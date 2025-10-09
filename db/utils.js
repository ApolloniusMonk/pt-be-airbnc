console.log(">>>utils loaded");

function addUserDefaults(users = []) {
  return users.map((user, index) => {
    return {
      user_id: index + 1,
      ...user,
      created_at: new Date(),
    };
  });
}

function formatProperties(properties = [], users = []) {
  return properties.map((property) => {
    const host = users.find(
      (user) => `${user.first_name} ${user.surname}` === property.host_name
    );
    return {
      host_id: host ? host.user_id : null,
      name: property.name,
      location: property.location,
      property_type: property.property_type,
      price_per_night: property.price_per_night,
      description: property.description,
    };
  });
}

function formatReviews(reviews = [], users = [], properties = []) {
  return reviews.map((review) => {
    const guest = users.find(
      (u) => `${u.first_name} ${u.surname}` === review.guest_name
    );
    const property = properties.find((p) => p.name === review.property_name);

    let property_id = null;
    let guest_id = null;
    let created_at = new Date();

    if (property) {
      property_id = property.property_id;
    }

    if (guest) {
      guest_id = guest.user_id;
    }

    if (review.created_at) {
      created_at = new Date(review.created_at);
    }

    return {
      property_id,
      guest_id,
      rating: review.rating,
      comment: review.comment,
      created_at,
    };
  });
}

function formatImages(images = [], properties = []) {
  return images.map((image) => {
    const property = properties.find((p) => p.name === image.property_name);

    let property_id = null;

    if (property) {
      property_id = property.property_id;
    }

    return { property_id, image_url: image.image_url, alt_text: image.alt_tag };
  });
}

module.exports = {
  addUserDefaults,
  formatProperties,
  formatReviews,
  formatImages,
};
