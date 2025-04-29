class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = [
      'page',
      'sortBy',
      'order',
      'limit',
      'fields',
      'search',
    ];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  search() {
    if (this.queryString.search) {
      const searchStr = this.queryString.search;
      this.query = this.query.find({
        $or: [
          { name: { $regex: searchStr, $options: 'i' } },
          { email: { $regex: searchStr, $options: 'i' } },
        ],
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sortBy) {
      const sortValue = this.queryString.sortBy;

      // Handle combined sort parameter (e.g., "name_asc", "email_desc")
      if (sortValue.includes('_')) {
        const [field, order] = sortValue.split('_');
        const sortOrder = order === 'desc' ? '-' : '';
        this.query = this.query.sort(`${sortOrder}${field}`);
      }
      // Handle special cases like "newest" and "oldest"
      else if (sortValue === 'newest') {
        this.query = this.query.sort('-createdAt');
      } else if (sortValue === 'oldest') {
        this.query = this.query.sort('createdAt');
      }
    } else {
      this.query = this.query.sort('-createdAt'); // Default: newest first
    }

    return this;
  }

  limit() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v -password');
    }

    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  executeQuery() {
    return this.query;
  }
}

module.exports = APIFeatures;
